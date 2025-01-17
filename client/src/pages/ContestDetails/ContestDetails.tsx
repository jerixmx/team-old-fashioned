import { useEffect, useState } from 'react';
import { useHistory, RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CircularProgress from '@material-ui/core/CircularProgress';
import FullWidthTabs from './ContestDetailTabs/ContestDetailTabs';
import { useAuth } from '../../context/useAuthContext';
import useStyles from './useStyles';
import { selectWinner } from '../../helpers/APICalls/contest';
import { getAllSubmissions } from '../../helpers/APICalls/submission';
import { Submission } from '../../interface/Submission';
import { useSnackBar } from '../../context/useSnackbarContext';
import { getContestDetails } from '../../helpers/APICalls/contest';
import { ContestAPIData } from '../../interface/Contest';
import relativeTime from '../../pages/Notifications/RelativeTime';

export default function ContestDetails({ match }: RouteComponentProps): JSX.Element {
  const classes = useStyles();
  const [submissionObj, setSubmissionObj] = useState<Submission[]>([]);
  const [contestDetails, setContestDetails] = useState<ContestAPIData>();
  const [winner, setWinner] = useState<string>('');
  const [beyondDeadline, setBeyondDeadline] = useState<boolean>(false);
  const [button, setButton] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [contestId, setContestId] = useState<string>('');
  const { loggedInUser } = useAuth();
  const { updateSnackBarMessage } = useSnackBar();

  const history = useHistory();

  useEffect(() => {
    const params = match.params as { id: string };
    setContestId(params.id);

    getAllSubmissions(params.id).then((data) => {
      setSubmissionObj(data.submission);
      setIsOwner(data.isOwner);
    });

    const getDetails = async (id: string) => {
      const response = await getContestDetails(id);
      if (response === null) {
        updateSnackBarMessage('Contest not found');
        history.push('/');
      } else if (response.error) {
        updateSnackBarMessage(response.error);
        history.push('/');
      } else {
        setContestDetails(response);
      }
    };
    getDetails(params.id);

    const hasSubmission = () => {
      if (!submissionObj) {
        return false;
      } else {
        return submissionObj.some((submission) => {
          return submission.files && submission.files.length > 0 ? true : false;
        });
      }
    };

    setBeyondDeadline(new Date(contestDetails?.deadline as Date) < new Date());
    const contestOwner = loggedInUser?.username === contestDetails?.userId?.username;
    setButton(
      beyondDeadline && contestOwner && hasSubmission() ? 'winner' : !beyondDeadline && !contestOwner ? 'submit' : '',
    );
  }, [match, updateSnackBarMessage, history, contestDetails, loggedInUser, submissionObj, beyondDeadline]);

  if (loggedInUser === undefined) return <CircularProgress />;
  if (!loggedInUser) {
    history.push('/login');
    // loading for a split seconds until history.push works
    return <CircularProgress />;
  }

  const handleWinner = async (submissionId: string) => {
    await selectWinner(contestId, submissionId).then((response) => {
      if (response.error) {
        updateSnackBarMessage(response.error);
        if (response.error === 'A winner for the contest has already been selected.') {
          setTimeout(function () {
            history.push(`/contest-details/${contestId}/payment`);
            return <CircularProgress />;
          }, 1000);
        }
      } else {
        updateSnackBarMessage('Winner selected!');
        setTimeout(function () {
          history.push(`/contest-details/${contestId}/payment`);
          return <CircularProgress />;
        }, 1000);
      }
    });
  };

  return (
    <>
      <Grid container component="main" className={classes.root} direction="column">
        <CssBaseline />
        <Grid container alignItems="center" justify="center">
          <Grid item xs={12} sm={10} md={8}>
            <Link to="/dashboard" className={classes.breadcrumb}>
              <ArrowBackIosIcon fontSize="inherit" /> Back to contests list
            </Link>
          </Grid>
          <Grid item xs={12} sm={10} md={8} className={classes.titleColumn}>
            <Box display="flex" flexWrap="nowrap" alignItems="center" bgcolor="transparent">
              <Box>
                <Typography className={classes.contestTitle} component="h1" variant="h5">
                  {contestDetails?.title}
                </Typography>
              </Box>
              <Box flexGrow={1}>
                <Button variant="contained" color="primary" disableElevation className={classes.prize}>
                  ${contestDetails?.prizeAmount}
                </Button>
              </Box>
              <div>
                {button === 'winner' ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      handleWinner(winner);
                    }}
                    className={classes.winnerButton}
                  >
                    select winner
                  </Button>
                ) : button === 'submit' ? (
                  <Button
                    component={Link}
                    to={`/file-upload/${contestId}`}
                    variant="outlined"
                    color="primary"
                    className={classes.winnerButton}
                  >
                    submit design
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            </Box>
            <Grid item xs={12} sm={10} md={8} className={classes.ownerColumn}>
              <Box display="flex" alignItems="center">
                <Box>
                  <Avatar src={contestDetails?.userId?.profilePicUrl} alt="Profile Photo" />
                </Box>
                <Box className={classes.userText} flexGrow={1}>
                  By {contestDetails?.userId?.username}
                </Box>
                <Box className={classes.time}>
                  <Typography variant="body2" className={classes.italicText}>
                    {beyondDeadline
                      ? `Contest deadline has passed`
                      : `Ends in ${relativeTime(contestDetails?.deadline as Date, 'until')}`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid className={classes.spacer}></Grid>
            <FullWidthTabs
              submissionList={submissionObj}
              setWinner={setWinner}
              description={contestDetails?.description as string}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
