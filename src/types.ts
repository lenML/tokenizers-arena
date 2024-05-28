import type { tokenizers } from "@lenml/tokenizers";

export type PreTrainedTokenizer = tokenizers.PreTrainedTokenizer;

export type Token = {
  token: string;
  encoding: number;
  start: number;
  end: number;
};

export type TokenizerDefine =
  | {
      type: "package";
      name: string;
    }
  | {
      type: "url";
      json_url: string;
      config_url: string;
    };
