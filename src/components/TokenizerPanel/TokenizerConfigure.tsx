import { useState } from "react";
import { TokenizersHub } from "../../TokenizersHub";
import { TokenizerDefine } from "../../types";
import styled from "styled-components";
import classNames from "classnames";

interface Props {
  onConfigChange: (config: TokenizerDefine) => void;
}

const TokenizerFromUrlsBox = styled.div`
  display: flex;
  flex-direction: column;

  padding-top: 16px;

  label {
    margin-bottom: 8px;
  }
  input {
    width: 100%;
    padding: 4px;
    font-size: 16px;
  }
  button {
    margin-top: 8px;
    padding: 4px;
    font-size: 16px;
  }
`;

const TokenizerFromUrls = ({ onConfigChange }: Props) => {
  const [formData, setFormData] = useState({
    json_url: "",
    config_url: "",
  });
  return (
    <TokenizerFromUrlsBox>
      <div>
        <label>
          JSON URL:
          <input
            type="text"
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, json_url: e.target.value }));
            }}
            placeholder="https://huggingface.co/.../tokenizer.json"
          />
        </label>
      </div>
      <div>
        <label>
          Config URL:
          <input
            type="text"
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, config_url: e.target.value }));
            }}
            placeholder="https://huggingface.co/.../tokenizer_config.json"
          />
        </label>
      </div>
      <div>
        <button
          disabled={!formData.json_url || !formData.config_url}
          onClick={() => {
            onConfigChange({
              type: "url",
              ...formData,
            });
          }}
        >
          Load
        </button>
      </div>
    </TokenizerFromUrlsBox>
  );
};

const TokenizerFromPackagesBox = styled.div`
  display: flex;

  flex-direction: column;

  .packages {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    button {
      padding: 4px;
      font-size: 16px;
    }
  }
`;

const TokenizerFromPackages = ({ onConfigChange }: Props) => {
  const packages = TokenizersHub.packages;
  return (
    <TokenizerFromPackagesBox>
      <p>
        Choose a tokenizer package from the following list. These tokenizers are
        pre-package and stored in CDN.
      </p>

      <div className="packages">
        {packages.map((pkg) => (
          <div key={pkg.name}>
            <button
              onClick={() => {
                onConfigChange({
                  type: "package",
                  name: pkg.name,
                });
              }}
            >
              {pkg.name}
            </button>
          </div>
        ))}
      </div>
    </TokenizerFromPackagesBox>
  );
};

const TokenizerConfigureBox = styled.div`
  display: flex;
  flex-direction: column;

  .configure-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;

    button {
      padding: 4px;
      font-size: 16px;

      background-color: transparent;
      border: none;
      border-bottom: 1px solid transparent;

      cursor: pointer;

      &.--selected {
        border-bottom-color: white;
        color: white;
      }
    }
  }
`;

// 选择 tokenizer 配置
export const TokenizerConfigure = ({ onConfigChange }: Props) => {
  const [mode, setMode] = useState<"urls" | "packages">("packages");

  return (
    <TokenizerConfigureBox>
      <div className="configure-tabs">
        <button
          className={classNames({ "--selected": mode === "urls" })}
          onClick={() => setMode("urls")}
        >
          From URLs
        </button>
        <button
          className={classNames({ "--selected": mode === "packages" })}
          onClick={() => setMode("packages")}
        >
          From Packages
        </button>
      </div>
      {mode === "urls" && <TokenizerFromUrls onConfigChange={onConfigChange} />}
      {mode === "packages" && (
        <TokenizerFromPackages onConfigChange={onConfigChange} />
      )}
    </TokenizerConfigureBox>
  );
};
