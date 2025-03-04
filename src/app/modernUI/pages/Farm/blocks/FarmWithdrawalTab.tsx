import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useFarmWithdrawal } from 'app/common/state/farm';
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

export const FarmWithdrawalTab = ({
  selectedFarm,
  isLoading,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
}) => {
  const {
    hasErrors,
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    isWithdrawalRequestsLoading,
    isWithdrawing,
    handleWithdraw,
    useBiconomy,
    setUseBiconomy,
  } = useFarmWithdrawal({
    selectedFarm,
    selectedSupportedToken,
    updateFarmInfo,
  });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.chain == EChain.POLYGON ? '462px' : '433px',
        }}
        justify="center"
      >
        <>
          {isLoading ||
          !selectedSupportedToken ||
          isWithdrawing ||
          isWithdrawalRequestsLoading ? (
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
                    label={'Withdraw ' + selectedSupportedToken.label}
                    available={selectedFarm.depositedAmount}
                    tokenSign={selectedFarm.sign}
                    onValueChange={handleWithdrawalFieldChange}
                    value={withdrawValue}
                    maxButton={true}
                    maxValue={selectedFarm.depositedAmount}
                    tokenOptions={selectedFarm.supportedTokens || []}
                    selectedToken={selectedSupportedToken}
                    setSelectedToken={selectSupportedToken}
                    error={withdrawValueError}
                  />
                </Box>
              </Box>

              <Box margin={{ top: 'medium' }}>
                <ProjectedWeeklyInfo
                  depositedAmount={selectedFarm.depositedAmount}
                  inputValue={-1 * +withdrawValue}
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
        </>
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          label={+withdrawValue > 0 ? 'Withdraw' : 'Enter amount'}
          disabled={
            isLoading ||
            isWithdrawing ||
            isWithdrawalRequestsLoading ||
            !+withdrawValue ||
            hasErrors
          }
          onClick={handleWithdraw}
        />
      </Box>
    </Box>
  );
};
