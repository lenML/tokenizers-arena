import { styled } from "styled-components";
import { Token } from "../../types";
import { useMemo } from "react";

const TokenStatsTitle = styled.div`
  color: var(--gray-100);
  font-weight: 700;
`;
const TokenStatsVal = styled.div`
  color: var(--gray-100);
  font-size: 28px;
  margin-top: 4px;
`;
const TokenStat = styled.div`
  display: inline-block;
  margin-right: 20px;
  min-width: 80px;
`;

export const TokenStatsContainer = ({
  value,
  tokens,
}: {
  value: string;
  tokens: Token[];
}) => {
  // 压缩率
  const comp_rate = useMemo(() => {
    const rate = tokens.length / value.length;
    if (Number.isNaN(rate)) {
      return 0;
    }
    return (Math.round(rate * 100 * 100) / 100).toFixed(2);
  }, [tokens.length, value.length]);

  return (
    <div>
      <TokenStat>
        <TokenStatsTitle>Tokens</TokenStatsTitle>
        <TokenStatsVal>{tokens.length}</TokenStatsVal>
      </TokenStat>
      <TokenStat>
        <TokenStatsTitle>Chars</TokenStatsTitle>
        <TokenStatsVal>{value.length}</TokenStatsVal>
      </TokenStat>
      <TokenStat>
        <TokenStatsTitle>Compress Rate (tokens / chars)</TokenStatsTitle>
        <TokenStatsVal>{comp_rate}%</TokenStatsVal>
      </TokenStat>
    </div>
  );
};
