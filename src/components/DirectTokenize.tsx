import { useCallback, useState } from "react";
import { styled } from "styled-components";
import { TokenizerDefine } from "../types";
import { TokenizerConfigure } from "./TokenizerPanel/TokenizerConfigure";
import { TokenizerPanel } from "./TokenizerPanel/TokenizerPanel";
import { useQueryParams } from "./useQueryParams";

const DirectTokenizeContainer = styled.div`
  display: flex;
  flex-direction: column;

  height: max-content;
  min-height: 100%;
  width: 80%;
  min-width: 640px;

  > p {
    span {
      user-select: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

export const DirectTokenInner = ({
  inputValue,
  onChange,
  initConfig,
  onConfigChanged,
}: {
  inputValue?: string | null;
  onChange?: (v: string) => any;
  initConfig?: TokenizerDefine | null;
  onConfigChanged?: (c: TokenizerDefine) => any;
}) => {
  const [config, setConfig] = useState<TokenizerDefine | null>(
    initConfig || null
  );
  const { getQueryParam } = useQueryParams();

  return (
    <>
      {config === null ? (
        <TokenizerConfigure
          onConfigChange={(config) => {
            setConfig(config);
            onConfigChanged?.(config);
          }}
        />
      ) : (
        <TokenizerPanel
          config={config}
          inputValue={inputValue}
          onChange={onChange}
          getInitValue={() => {
            return getQueryParam("content");
          }}
        ></TokenizerPanel>
      )}
    </>
  );
};

export const DirectTokenize = () => {
  const [id, setId] = useState(1);
  const { setQueryParam, getQueryParam, deleteQueryParam } = useQueryParams();

  const [initConfig, setConfig] = useState<TokenizerDefine | null>(() => {
    const config_b64 = getQueryParam("config");
    if (!config_b64) return null;
    try {
      const json = JSON.parse(config_b64);
      return json;
    } catch (error) {
      console.error(error);
    }
    return null;
  });

  const onConfigChanged = useCallback(
    (config: TokenizerDefine) => {
      setQueryParam("config", JSON.stringify(config));
    },
    [setQueryParam]
  );

  return (
    <DirectTokenizeContainer>
      <p>
        <span
          onClick={() => {
            setId(Date.now());
            setConfig(null);
            deleteQueryParam("content");
            deleteQueryParam("config");
          }}
        >
          [reset]
        </span>
      </p>
      <DirectTokenInner
        key={id}
        onConfigChanged={onConfigChanged}
        initConfig={initConfig}
        onChange={(value) => {
          // 只写入 1024 字符以内的
          if (value.length < 1024) {
            setQueryParam("content", value);
          }
        }}
      />
    </DirectTokenizeContainer>
  );
};
