import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useFarmDeposit } from 'app/common/state/farm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const BoostFarmDepositTab = ({
  isLoading,
  selectedFarm,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
}) => {
  const {
    hasErrors,
    depositValueError,
    depositValue,
    handleDepositValueChange,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo
  } = useFarmDeposit({ selectedFarm, selectedSupportedToken, updateFarmInfo });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.chain == EChain.POLYGON ? '462px' : '433px',
        }}
      >
        {isLoading || !selectedSupportedToken || isApproving || isDepositing ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <>
            <Box margin={{ top: 'large' }}>
              <TopHeader selectedFarm={selectedFarm} />
              <Box margin={{ top: 'medium' }}>
                <NumericInput
                  label={'Deposit ' + selectedSupportedToken.label}
                  tokenSign={selectedFarm.sign}
                  onValueChange={handleDepositValueChange}
                  value={depositValue}
                  isLoadingMaxValue={isFetchingSupportedTokenInfo}
                  maxButton={true}
                  maxValue={selectedSupportedTokenInfo?.balance}
                  tokenOptions={selectedFarm.supportedTokens || []}
                  selectedToken={selectedSupportedToken}
                  setSelectedToken={selectSupportedToken}
                  error={depositValueError}
                />
              </Box>
            </Box>
            <Box margin={{ top: 'medium' }}>
              <ProjectedWeeklyInfo
                depositedAmount={selectedFarm.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarm.interest}
                sign={selectedFarm.sign}
              />
              <Info label="APY" value={toExactFixed(selectedFarm.interest,2).toLocaleString() + '%'} />
              <Info
                label="Pool liquidity"
                value={
                  selectedFarm.sign +
                  (+selectedFarm.totalAssetSupply).toLocaleString()
                }
              />
              <FeeInfo
                biconomyToggle={selectedFarm.chain == EChain.POLYGON}
                useBiconomy={useBiconomy}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={
                  !useBiconomy || selectedFarm.chain != EChain.POLYGON
                }
              />
            </Box>
          </>
        )}
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isDepositing ||
            !(+depositValue > 0) ||
            isFetchingSupportedTokenInfo ||
            hasErrors
          }
          label={
            +depositValue > 0
              ? +selectedSupportedTokenInfo?.allowance >= +depositValue
                ? 'Deposit'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +selectedSupportedTokenInfo?.allowance >= +depositValue
              ? handleDeposit
              : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
