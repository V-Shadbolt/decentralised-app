import { roundNumberDown } from 'app/common/functions/utils';
import { useLock } from 'app/common/state/stake';
import {
  Info,
  NumericInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';

export const LockTab = ({ isLoading, alluoInfo, updateAlluoInfo, ...rest }) => {
  const {
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleApprove,
    handleLock,
    hasErrors,
    lockValueError,
  } = useLock({ alluoInfo, updateAlluoInfo });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: '415px',
        }}
        justify="center"
      >
        {isLoading || isApproving || isLocking ? (
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
              <Text textAlign="center" weight="bold">
                You have {roundNumberDown(alluoInfo.locked, 2)} $ALLUO staked
              </Text>
              <Box margin={{ top: 'medium' }}>
                <NumericInput
                  label="Lock"
                  tokenSign="$"
                  onValueChange={handleLockValueChange}
                  value={lockValue}
                  maxButton={true}
                  maxValue={alluoInfo?.balance}
                  error={lockValueError}
                />
              </Box>
            </Box>
            <Box margin={{ top: 'medium' }}>
              <Info label="Unstaked $ALLUO balance" value={roundNumberDown(alluoInfo.balance, 2)} />
              <Info label="$ALLUO APR" value={alluoInfo.apr + '%'} />
              <Info label="$ALLUO earned" value={alluoInfo.earned} />
              <Info label="Total $ALLUO staked" value={alluoInfo.totalLocked} />
            </Box>
          </>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isLocking ||
            hasErrors ||
            !(+lockValue > 0)
          }
          label={
            +lockValue > 0
              ? +alluoInfo?.allowance >= +lockValue
                ? 'Lock'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +alluoInfo?.allowance >= +lockValue ? handleLock : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
