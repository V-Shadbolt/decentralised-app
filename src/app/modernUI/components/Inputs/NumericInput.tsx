import { roundNumberDown } from 'app/common/functions/utils';
import { TSupportedToken } from 'app/common/types/global';
import { Box, Select, Text, TextInput } from 'grommet';
import { Down } from 'grommet-icons';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import NumberFormat from 'react-number-format';
import styled from 'styled-components';
import { TokenIcon } from '../Icons';
import { MaxButton } from './MaxButton';
import { RelativeBox } from './RelativeBox';

const AbsoluteBox = styled(Box)`
  position: absolute;
  right: 0.4em;
  left: auto;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface INumericInput {
  label?: string;
  tokenSign?: string;
  value: string;
  available?: string;
  onValueChange: Function;
  selectedToken?: TSupportedToken;
  setSelectedToken?: Function;
  tokenOptions?: TSupportedToken[];
  error: string;
  maxValue?: string | number;
  maxButton?: boolean;
  slippageWarning?: boolean;
  lowSlippageTokenLabels?: string[];
  isLoadingMaxValue?: boolean;
}

export const NumericInput = ({
  label,
  tokenSign,
  value,
  available,
  maxValue,
  maxButton = false,
  onValueChange,
  tokenOptions,
  selectedToken,
  setSelectedToken,
  slippageWarning = false,
  lowSlippageTokenLabels,
  error,
  isLoadingMaxValue = false,
  ...rest
}: INumericInput) => {
  const [formattedValue, setFormattedValue] = useState('');
  const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
  const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

  return (
    <>
      <Box>
        <Box direction="row" justify="between">
          <Text size="medium" color="soul">
            {label}
          </Text>
          {isLoadingMaxValue ? (
            <Box width="100px">
              <Skeleton count={1} />
            </Box>
          ) : (
            <Text size="medium" color="soul">
              {available != undefined ? (
                'Available: ' + tokenSign + roundNumberDown(+available)
              ) : (
                <>
                  {!!selectedToken &&
                    'Wallet: ' + tokenSign + roundNumberDown(+(+maxValue))}
                </>
              )}
            </Text>
          )}
        </Box>
        <RelativeBox margin={{ top: 'xxsmall' }}>
          <NumberFormat
            value={formattedValue}
            placeholder="0.00"
            customInput={TextInput}
            thousandSeparator={thousandsSeparator}
            decimalSeparator={decimalSeparator}
            onValueChange={values => {
              const { formattedValue, value } = values;
              onValueChange(value);
              setFormattedValue(formattedValue);
            }}
          />
          <AbsoluteBox direction="row" gap="xsmall">
            {maxButton && maxValue != undefined && (
              <MaxButton
                primary
                onClick={() => {
                  setFormattedValue(roundNumberDown(maxValue));
                }}
              >
                Max
              </MaxButton>
            )}
            {tokenOptions && (
              <Select
                width="10px"
                plain
                icon={<Down size="small" />}
                dropAlign={{ right: 'right', top: 'bottom' }}
                options={tokenOptions}
                value={selectedToken?.label}
                valueLabel={option => {
                  return <TokenIcon label={option} />;
                }}
                onChange={({ option }) => setSelectedToken(option)}
                labelKey="label"
                valueKey="address"
              />
            )}
          </AbsoluteBox>
        </RelativeBox>
        <Box
          margin={{ top: 'small' }}
          height={slippageWarning ? '60px' : 'auto'}
        >
          {error ? (
            <Text color="error" size="small">
              {error}
            </Text>
          ) : (
            <>
              {slippageWarning && (
                <>
                  <Text size="small" color="soul">
                    Withdrawing in any token other than{' '}
                    {lowSlippageTokenLabels.join('/')} increases slippage.
                    Values shown are an approximation and may change subject to
                    exhange rates
                  </Text>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </>
  );
};
