import styled from "styled-components";
import { useEffect, useMemo, useRef, useState } from "react";

import HighlightWithinTextarea from "react-highlight-within-textarea";
import type { Editor } from "draft-js";
import { PreTrainedTokenizer, TokenizerDefine } from "../../types";
import { TokenizersHub } from "../../TokenizersHub";
import { TokenStatsContainer } from "./TokenStatsContainer";

import "./colors.css";

const example_text1 = `
Many words map to one token, but some don't: indivisible.

Unicode characters like emojis may be split into many tokens containing the underlying bytes: 🤚🏾

Sequences of characters commonly found next to each other may be grouped together: 1234567890
`.trim();

const Body = styled.div`
  box-sizing: border-box;
  width: 100%;
  flex: 1 0 auto;
  font-size: 16px;
  line-height: 24px;
  margin: 0 auto;
  max-width: 100%;
  overflow: hidden;

  h3 {
    font-size: 20px;
    line-height: 28px;
  }
  p {
    line-height: 1.5em;
    margin-bottom: 1em;
    margin-top: 1em;
  }
`;
const EditorContainer = styled.div`
  font-family: var(--monospace);
  font-size: 15px;
  min-height: 200px;
  padding: 10px 12px;
  width: 100%;

  background-clip: padding-box;
  background-color: #1f1f1f;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  box-sizing: border-box;
  color: var(--gray-200);
  display: inline-block;
  font-family: var(--sans-serif);
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  vertical-align: top;

  max-height: 500px;
  min-height: 200px;

  cursor: text;

  overflow: auto;

  mark {
    background: var(--primary-300);
  }

  &:focus-within {
    border-color: var(--input-border-focus);
    box-shadow: 0 0 0 0.2rem var(--primary-100a);
    outline: 0;
  }
`;

const TokenizerOutput = styled.div`
  background: var(--gray-800);
  border-radius: 3px;
  margin-top: 1em;
  max-height: 500px;
  min-height: 200px;
  overflow: auto;
  padding: 10px 12px 45px;
  position: relative;
  transition: opacity 0.3s;
  word-break: break-word;

  span {
    font-family: var(--monospace);
    font-size: 15px;
  }
`;

const Button = styled.button`
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  font-weight: 500;
  justify-content: center;
  line-height: 1.4;
  position: relative;
  transition: box-shadow 0.3s, background-color 0.3s, color 0.3s;
  -webkit-user-select: none;
  user-select: none;

  font-size: 14px;
  line-height: 20px;
  background-color: var(--gray-700);
  color: var(--gray-200);
  padding: 6px 12px;

  & + & {
    margin-left: 8px;
  }

  &:hover {
    background-color: var(--gray-600);
  }
  &:active {
    background-color: var(--gray-800);
  }
`;

const colors = [
  "rgba(107,64,216,.3)",
  "rgba(104,222,122,.4)",
  "rgba(244,172,54,.4)",
  "rgba(239,65,70,.4)",
  "rgba(39,181,234,.4)",
];

const useSelectionTokenRange = ({
  setHighlight,
}: {
  setHighlight: (range: [number, number] | null) => void;
}) => {
  useEffect(() => {
    const calcSelectionRange = () => {
      const selection = window.getSelection();
      if (!selection) {
        return;
      }
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      if (!anchorNode || !focusNode) {
        return;
      }
      if (anchorNode === focusNode) {
        return;
      }
      const findData = (node: Node): [number, number] | null => {
        if (
          node instanceof HTMLElement &&
          node.dataset.start &&
          node.dataset.end
        ) {
          return [Number(node.dataset.start), Number(node.dataset.end)];
        }
        if (node.parentNode) {
          return findData(node.parentNode);
        }
        return null;
      };
      const anchor_data = findData(anchorNode);
      const end_data = findData(focusNode);
      if (anchor_data && end_data) {
        const start = Math.min(...anchor_data, ...end_data);
        const end = Math.max(...anchor_data, ...end_data);
        setHighlight([start, end]);
      }
    };

    let selecting = false;
    const mousedown_handler = () => {
      selecting = true;
      setHighlight(null);
    };
    const mouseup_handler = () => {
      if (selecting) {
        calcSelectionRange();
      }
      selecting = false;
    };
    const mousemove_handler = () => {
      if (selecting) {
        calcSelectionRange();
      }
    };

    window.addEventListener("mousedown", mousedown_handler);
    window.addEventListener("mouseup", mouseup_handler);
    window.addEventListener("mousemove", mousemove_handler);

    return () => {
      window.removeEventListener("mousedown", mousedown_handler);
      window.removeEventListener("mouseup", mouseup_handler);
      window.removeEventListener("mousemove", mousemove_handler);
    };
  }, [setHighlight]);
};

const useTokenizer = (config: TokenizerDefine) => {
  const [tokenizer, setTokenizer] = useState<null | PreTrainedTokenizer>(null);

  useEffect(() => {
    const loadTokenizer = async () => {
      const tokenizer = await TokenizersHub.instance.get(config);
      // NOTE: 因为 tokenizer is callable object
      setTokenizer(() => tokenizer);
    };
    loadTokenizer();
  }, [config]);

  return {
    tokenizer,
  };
};

const useTokenizerInfo = (tokenizer?: PreTrainedTokenizer | null) => {
  const [info, setInfo] = useState<null | { [key: string]: any }>(null);
  useEffect(() => {
    if (tokenizer) {
      setInfo(() => TokenizersHub.instance.info(tokenizer));
    }
  }, [tokenizer]);
  return info;
};

const TokenizerInfoBox = styled.div`
  background-color: var(--gray-800);
  margin-bottom: 1rem;

  .title {
    cursor: pointer;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.2);

    .icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;

      height: 16px;
      width: 16px;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    border: 1px solid var(--gray-700);

    td {
      padding: 8px;
      border: 1px solid var(--gray-700);
    }
  }
`;

const TokenizerInfo = ({
  tokenizer,
  config,
}: {
  tokenizer?: PreTrainedTokenizer | null;
  config?: TokenizerDefine;
}) => {
  const [expanded, setExpanded] = useState(false);
  const info = useTokenizerInfo(tokenizer);
  if (!info) {
    return null;
  }
  // 使用 table 标签展示 tokenizer 的信息
  const table = (
    <table>
      <tbody>
        {Object.entries(info).map(([key, value]) => {
          if (key === "chat_template") {
            let chat_template_content = value;
            if (value && typeof value === "object") {
              chat_template_content = value.default ?? Object.values(value)[0];
            }
            if (typeof chat_template_content !== "string") {
              chat_template_content = "";
            }
            return (
              <tr key={key}>
                <td>{key}</td>
                <td>
                  <textarea
                    readOnly
                    placeholder="No chat template provided."
                    value={chat_template_content}
                    style={{ width: "100%", height: "100px", resize: "none" }}
                  ></textarea>
                </td>
              </tr>
            );
          }
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>
                <span>{value}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const name = !config
    ? "-"
    : config.type === "package"
    ? config.name
    : config.json_url.slice(
        config.json_url.lastIndexOf("/") + 1,
        config.json_url.lastIndexOf(".")
      );

  return (
    <TokenizerInfoBox>
      <div
        className="title"
        onClick={() => {
          setExpanded((v) => !v);
        }}
      >
        <span className="icon">{expanded ? "-" : "+"}</span>
        Tokenizer info: {name}
      </div>
      {expanded ? table : null}
    </TokenizerInfoBox>
  );
};

export function TokenizerPanel({
  config,
  onChange,
  inputValue,
  getInitValue,
}: {
  config: TokenizerDefine;
  onChange?: (content: string) => any;
  inputValue?: string | null;
  getInitValue?: () => string | undefined | null;
}) {
  const { tokenizer } = useTokenizer(config);

  const [value, setValue] = useState(
    () => getInitValue?.() ?? "Potato potato tomato potato."
  );
  const hwtRef = useRef(null as null | Editor);

  const tokens = useMemo(() => {
    if (!tokenizer) {
      return [];
    }
    try {
      return TokenizersHub.instance.tokenize(value, tokenizer);
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [tokenizer, value]);

  useEffect(() => {
    if (typeof inputValue === "string") {
      setValue(inputValue);
    }
  }, [inputValue, onChange]);

  // highlight ranges
  const [highlight, setHighlight] = useState(null as null | [number, number]);
  const [selectionRange, setSelectionRange] = useState(
    null as null | [number, number]
  );

  useSelectionTokenRange({
    setHighlight: setSelectionRange,
  });

  const updateValue = (value: string) => {
    setValue(value);
    onChange?.(value);
  };

  if (!tokenizer) {
    return (
      <Body>
        <span>Tokenizer loading...</span>
      </Body>
    );
  }

  return (
    <Body>
      <TokenizerInfo tokenizer={tokenizer} config={config} />

      <EditorContainer
        onClick={() => {
          hwtRef.current?.focus();
        }}
      >
        <HighlightWithinTextarea
          ref={hwtRef}
          highlight={selectionRange || highlight}
          value={value}
          onChange={(value) => updateValue(value)}
        />
      </EditorContainer>
      <div
        style={{
          marginTop: "1em",
          marginBottom: "1em",
        }}
      >
        <Button onClick={() => updateValue("")}>Clear</Button>
        <Button onClick={() => updateValue(example_text1)}>Show Example</Button>
      </div>
      <TokenStatsContainer value={value} tokens={tokens}></TokenStatsContainer>
      <TokenizerOutput>
        {tokens.map((token, i) => {
          const color = colors[i % colors.length];
          return (
            <span
              data-token={token.token}
              data-start={token.start}
              data-end={token.end}
              onMouseMove={() => {
                setHighlight([token.start, token.end]);
              }}
              onMouseLeave={() => {
                setHighlight(null);
              }}
              key={i + token.token}
              style={{ backgroundColor: color }}
            >
              {token.token}
            </span>
          );
        })}
      </TokenizerOutput>
    </Body>
  );
}
