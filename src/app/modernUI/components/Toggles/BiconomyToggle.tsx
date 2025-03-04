import { mode } from 'app/common/state/atoms';
import { Box, Button, Text } from 'grommet';
import ReactTooltip from 'react-tooltip';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

const ReactTooltipStyledDark = styled(ReactTooltip)`
  &.place-bottom {
    background: #44444;
    border-radius: 8px;
    width: 262px;
    height: 48px;
    color: #FFFFF;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
  }
`;

const ReactTooltipStyledLight = styled(ReactTooltip)`
  &.place-bottom {
    background: #f4f8ff;
    border-radius: 8px;
    width: 262px;
    height: 48px;
    color: #4c4c4c;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
  }
`;

export function BiconomyToggle({ useBiconomy, setUseBiconomy, disabled }) {
  const [modeAtom] = useRecoilState(mode);
  const useBiconomyButton = useBiconomy ? 'row' : 'row-reverse';
  const useBiconomyButtonColor = !useBiconomy ? '#CCCCCC' : '#2A73FF';

  return (
    <Box flex justify="end" direction="row">
      <Box
        flex
        direction="row"
        align="center"
        justify="end"
        margin={{ top: '9px' }}
      >
        <Text
          size="12px"
          margin={{ right: '8px' }}
          color="#999999"
          weight={500}
        >
          <span
            style={{ textDecoration: 'underline', marginLeft: '5px' }}
            data-tip
            data-for="biconomyTip"
          >
            Biconomy
          </span>{' '}
          ON/OFF?
        </Text>
        <Button disabled={true} onClick={() => setUseBiconomy(!useBiconomy)}>
          {/*<Button disabled={disabled} onClick={() => setUseBiconomy(!useBiconomy)}>*/}
          <Box
            width="46px"
            height="20px"
            round="10px"
            pad="0px 7px 0px 7px"
            background={useBiconomyButtonColor}
            direction={useBiconomyButton}
            justify="between"
            align="center"
          >
            <Text size="9px" color="white">
              {useBiconomy ? 'ON' : 'OFF'}
            </Text>
            <span
              style={{
                width: '13px',
                height: '13px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '50px',
                color: 'white',
                cursor: 'pointer',
                border: 'none',
              }}
            ></span>
            {modeAtom === 'light' ? (
              <ReactTooltipStyledLight
                id="biconomyTip"
                place="bottom"
                effect="float"
              >
                Turning off Biconomy means Alluo will no longer pay your
                transaction fee.
              </ReactTooltipStyledLight>
            ) : (
              <ReactTooltipStyledDark
                id="biconomyTip"
                place="bottom"
                effect="float"
              >
                Turning off Biconomy means Alluo will no longer pay your
                transaction fee.
              </ReactTooltipStyledDark>
            )}
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
