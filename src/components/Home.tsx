import { styled } from "styled-components";

const Body = styled.div`
  width: 800px;
  flex: 1 0 auto;
  font-size: 16px;
  line-height: 24px;
  margin: 0 auto;
  max-width: 100%;
  padding: 40px 56px;
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
const Header = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 1.4em;
  h1 {
    flex: 1 1 auto;
    margin: 0;
  }
`;

export const Home = () => {
  return (
    <Body>
      <Header>
        <h1>🦙 @lenml/tokenizers Playground</h1>
      </Header>
      <br />
      <div style={{ display: "flex", gap: "8px" }}>
        <a
          href="https://www.npmjs.com/package/@lenml/tokenizers"
          target="_blank"
        >
          <img
            alt="NPM Downloads"
            src="https://img.shields.io/npm/dm/%40lenml%2Ftokenizers"
          />
        </a>
        <a
          href="https://www.npmjs.com/package/@lenml/tokenizers"
          target="_blank"
        >
          <img
            alt="NPM Version"
            src="https://img.shields.io/npm/v/%40lenml%2Ftokenizers"
          />
        </a>
        <a
          href="https://www.npmjs.com/package/@lenml/tokenizers"
          target="_blank"
        >
          <img
            alt="NPM License"
            src="https://img.shields.io/npm/l/%40lenml%2Ftokenizers"
          />
        </a>
      </div>
      <p>
        a lightweight no-dependency fork from transformers.js (only tokenizers)
      </p>

      <h3>Learn about language model tokenization</h3>
      <p>
        Language models process text using tokens, which are common sequences of
        characters found in text. Models understand statistical relationships
        between tokens to predict the next token in a sequence.
      </p>
      <p>
        This playground uses the{" "}
        <a href="https://github.com/lenML/tokenizers">tokenizers</a> to tokenize
        text. The library supports vocabularies for models like llama2, mistral,
        and zephyr. Key features include: fast, TypeScript support, high test
        coverage.
      </p>
      <p>
        You can use the tool below to see how text gets tokenized into tokens,
        and the total token count. Note different models use different
        tokenizers, so the same text can tokenize differently.
      </p>
      <p>Explore how text gets tokenized using this playground.</p>
    </Body>
  );
};
