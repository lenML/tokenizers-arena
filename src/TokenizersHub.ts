import { TokenizerLoader, tokenizers } from "@lenml/tokenizers";
import { Token, TokenizerDefine } from "./types";
import EventEmitter from "eventemitter3";

type PreTrainedTokenizer = tokenizers.PreTrainedTokenizer;

// NOTE: 这里的 package version 并不是 tokenizers 的 version，而是打包版本的 version，并不一定和 `tokenizers` 版本一致
const package_version = "3.4.0";
export const packages = [
  "gemma2",
  "qwen2_5",
  "aya_expanse",
  "llama3_2",
  "mistral_nemo",
  "gemini",
  "llama3_1",
  "llama2",
  "llama3",
  "gpt4o",
  "gpt4",
  "gpt35turbo",
  "gpt35turbo16k",
  "gpt3",
  "gemma",
  "claude",
  "claude1",
  "gpt2",
  "baichuan2",
  "chatglm3",
  "command_r_plus",
  "internlm2",
  "qwen1_5",
  "yi",
  "text_davinci002",
  "text_davinci003",
  "text_embedding_ada002",
  "deepseek_v3",
]
  .sort()
  .map((x) => ({
    name: x,
    url: `https://cdn.jsdelivr.net/npm/@lenml/tokenizer-${x}@${package_version}/+esm`,
  }));

// 从这里取得所有的 Tokenizers
// 可以来自 package 或者 url
export class TokenizersHub {
  static instance = new TokenizersHub();
  static packages = packages;

  events = new EventEmitter<{
    change: () => any;
  }>();

  private pkg_registry: Record<string, PreTrainedTokenizer> = {};

  private url_registry: Record<string, PreTrainedTokenizer> = {};

  private errors: Record<string, any> = {};

  constructor() {
    if (TokenizersHub.instance) {
      throw new Error("TokenizersHub is a singleton class");
    }
  }

  get_status() {
    return {
      loaded: Object.keys(this.pkg_registry).length,
      downloaded: Object.keys(this.url_registry).length,
      errors: Object.keys(this.errors).length,
    };
  }

  get_registry_status() {
    return {
      pkg_registry: this.pkg_registry,
      url_registry: this.url_registry,

      loaded_pkg: Object.keys(this.pkg_registry),
      loaded_url: Object.keys(this.url_registry),
    };
  }

  async getPackage(name: string) {
    if (!this.pkg_registry[name]) {
      const pkg = packages.find((x) => x.name === name);
      if (pkg) {
        const module = await import(/* @vite-ignore */ pkg.url);
        const { fromPreTrained } = module;
        this.pkg_registry[name] =
          (await fromPreTrained()) as PreTrainedTokenizer;
        this.events.emit("change");
      }
    }
    return this.pkg_registry[name];
  }

  private async fetchJson(url: string) {
    const content = await fetch(url);
    if (content.status !== 200) {
      throw new Error(
        `fetch ${url} failed: ${content.status} ${
          content.statusText
        } \n${await content.text()}`.trim()
      );
    }
    try {
      return await content.json();
    } catch (error) {
      console.error(error);
      throw new Error(
        `parse data ${url} error: ${(error as any)?.message || error}`
      );
    }
  }

  private async loadFromUrl(
    json_url: string,
    config_url: string
  ): Promise<PreTrainedTokenizer> {
    const tokenizer = await TokenizerLoader.fromPreTrained({
      tokenizerJSON: await this.fetchJson(json_url),
      tokenizerConfig: await this.fetchJson(config_url),
    });

    return tokenizer;
  }

  async getFromUrl(json_url: string, config_url: string) {
    if (this.url_registry[json_url]) {
      return this.url_registry[json_url];
    }
    const tokenizer = await this.loadFromUrl(json_url, config_url);
    this.url_registry[json_url] = tokenizer;

    this.events.emit("change");
    return tokenizer;
  }

  get(config: TokenizerDefine) {
    switch (config.type) {
      case "package":
        try {
          return this.getPackage(config.name);
        } catch (error) {
          this.errors[config.name] = error;
          this.events.emit("change");
          throw error;
        }
      case "url":
        try {
          return this.getFromUrl(config.json_url, config.config_url);
        } catch (error) {
          this.errors[config.json_url] = error;
          this.events.emit("change");
          throw error;
        }
    }
  }

  tokenize(input: string, tokenizer: PreTrainedTokenizer): Token[] {
    const ids = tokenizer.encode(input, {
      add_special_tokens: false,
    });
    // const encoded = tokenizer._encode_text(input) || [];
    const tokens = ids.map((x) => tokenizer.decode_single([x], {}));

    let pos = 0;
    const content_tokens = ids.map((id, i) => {
      const token = tokens[i];
      const obj = {
        token,
        encoding: id,
        start: pos,
        end: pos + token.length,
      };
      pos += token.length;
      return obj;
    });
    return content_tokens;
  }

  info(tokenizer: PreTrainedTokenizer) {
    return {
      vocab_size: tokenizer.model.vocab.length,
      // added_tokens_num: tokenizer.added_tokens.length,
      // additional_special_tokens_num: tokenizer.additional_special_tokens.length,
      // special_tokens_num: tokenizer.special_tokens.length,
      chat_template: tokenizer.chat_template,
      pad_token:
        (tokenizer as any).getToken("pad_token") ?? tokenizer.pad_token,
      // unk_token: tokenizer.getToken("unk_token") ?? tokenizer.pad_token,
      bos_token:
        (tokenizer as any).getToken("bos_token") ?? tokenizer.pad_token,
      eos_token:
        (tokenizer as any).getToken("eos_token") ?? tokenizer.pad_token,
      // mask_token: tokenizer.getToken("mask_token") ?? tokenizer.pad_token,
    };
  }
}
