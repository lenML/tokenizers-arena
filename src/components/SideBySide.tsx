import { styled } from "styled-components";
import { useCallback, useState } from "react";
import { DirectTokenInner } from "./DirectTokenize";
import { useQueryParams } from "./useQueryParams";
import { TokenizerDefine } from "../types";

const SideBySideContainer = styled.div`
  display: flex;
  flex-direction: row;

  height: 100%;
  width: 80%;
  min-width: 640px;

  > div {
    flex: 1;
  }

  .divider {
    flex: 0 0 1px;
    width: 1px;
    margin: 0 16px;
    background-color: var(--gray-700);
  }

  h3 small {
    font-weight: 100;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const useTokenizerConfigParam = (key: string) => {
  const { getQueryParam } = useQueryParams();

  const [config, setConfig] = useState<TokenizerDefine | null>(() => {
    const config_b64 = getQueryParam(key);
    if (!config_b64) return null;
    try {
      const json = JSON.parse(config_b64);
      return json;
    } catch (error) {
      console.error(error);
    }
    return null;
  });

  return [config, setConfig] as const;
};

const useInitContent = () => {
  const { getQueryParam } = useQueryParams();
  return useState(() => {
    const content = getQueryParam("content");
    return content || null;
  })[0];
};

export const SideBySide = () => {
  const [left_id, setLeftId] = useState(1);
  const [right_id, setRightId] = useState(1);

  const initContent = useInitContent();

  const [value, setValue] = useState(
    initContent ??
      "👋Your modifications on both sides will be synchronized for easy comparison."
  );

  const { setQueryParam, deleteQueryParam } = useQueryParams();

  const [initLeftConfig, setLc] = useTokenizerConfigParam("left");
  const [initRightConfig, setRc] = useTokenizerConfigParam("right");

  const onChange = useCallback(
    (value: string) => {
      setValue(value);

      // 只写入 1024 字符以内的
      if (value.length < 1024) {
        setQueryParam("content", value);
      }
    },
    [setValue, setQueryParam]
  );

  return (
    <SideBySideContainer>
      <div>
        <h3>
          Tokenizer 1{" "}
          <small
            onClick={() => {
              setLeftId(Date.now());
              setLc(null);
              setRc(null);
              deleteQueryParam("content");
              deleteQueryParam("left");
            }}
          >
            reset
          </small>{" "}
        </h3>
        <DirectTokenInner
          key={left_id}
          inputValue={value}
          onChange={onChange}
          initConfig={initLeftConfig}
          onConfigChanged={(config) => {
            setQueryParam("left", JSON.stringify(config));
          }}
        />
      </div>
      <div className="divider"></div>
      <div>
        <h3>
          Tokenizer 2{" "}
          <small
            onClick={() => {
              setRightId(Date.now());
              setLc(null);
              setRc(null);
              deleteQueryParam("content");
              deleteQueryParam("right");
            }}
          >
            reset
          </small>
        </h3>
        <DirectTokenInner
          key={right_id}
          inputValue={value}
          onChange={onChange}
          initConfig={initRightConfig}
          onConfigChanged={(config) => {
            setQueryParam("right", JSON.stringify(config));
          }}
        />
      </div>
    </SideBySideContainer>
  );
};
