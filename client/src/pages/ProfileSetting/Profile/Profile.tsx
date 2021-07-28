import { FC, useState, useContext } from 'react';
import ContestItem from '../../../components/ContestItem/ContestItem';
import { ContestContext } from '../../../context/useContestContext';
import { AuthContext } from '../../../context/useAuthContext';
import { Button, CircularProgress, Grid, Box, Tabs, Tab, Avatar, Typography } from '@material-ui/core';
import { useSnackBar } from '../../../context/useSnackbarContext';
import demoProfilePhoto from '../../../Images/demo-profile-photo.png';
import uploadImagesAPI from '../../../helpers/APICalls/uploadImages';
import updateProfilePicture from '../../../helpers/APICalls/updateProfilePicture';
import useStyles from './useStyles';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
};

const Profile: FC = (): JSX.Element => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const { activeContests, inactiveContests } = useContext(ContestContext);
  const { loggedInUser, updateLoginContext } = useContext(AuthContext);
  const { updateSnackBarMessage } = useSnackBar();
  const [isLoading, setisLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setValue(newValue);
  };

  const openContests = [];
  const closedContests = [];
  for (const contest of activeContests.concat(inactiveContests)) {
    let firstImgSrc;
    let imageCnt = 0;
    for (let i = 0; i < contest.subs.length; i++) {
      if (contest.subs[i].files.length > 0) {
        if (!firstImgSrc) {
          firstImgSrc = contest.subs[i].files[0];
        }
        imageCnt += contest.subs[i].files.length;
      }
    }
    if (new Date(contest.deadline) > new Date()) {
      openContests.push(
        <ContestItem
          key={`activeContest-${contest._id}`}
          imgSrc={firstImgSrc || demoProfilePhoto}
          imgCount={imageCnt}
          headline={contest.title}
          deadline={contest.deadline}
          byline={contest.description}
          prizeAmt={contest.prizeAmount}
        />,
      );
    } else {
      closedContests.push(
        <ContestItem
          key={`inactiveContest-${contest._id}`}
          imgSrc={firstImgSrc || demoProfilePhoto}
          imgCount={imageCnt}
          headline={contest.title}
          deadline={contest.deadline}
          byline={contest.description}
          prizeAmt={contest.prizeAmount}
          completed
        />,
      );
    }
  }

  const profilePicUploadHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      setisLoading(true);
      const formData = new FormData();
      formData.append('designImg', fileList[0]);
      const result = await uploadImagesAPI(formData);
      if (result.error) {
        updateSnackBarMessage(result.error.message);
      }
      if (result.success) {
        updateSnackBarMessage('Profile picture uploaded');
        const response = await updateProfilePicture(result.success.urlArray[0]);
        if (response.user) {
          updateLoginContext(response);
        }
      }
      setisLoading(false);
    }
  };

  return (
    <Grid container direction="column" className={classes.profileContainer}>
      <Grid xs={12} md={10} item className={classes.avatarContainer}>
        <Box textAlign="center">
          <Avatar className={classes.profileImg} src={loggedInUser?.profilePicUrl} />
          <Typography className={classes.name}>{loggedInUser?.username}</Typography>
          <Button size="small" variant="contained" component="label" color="primary" className={classes.btn}>
            <input type="file" accept="image/*" hidden onChange={profilePicUploadHandler} />
            {isLoading ? <CircularProgress color="secondary" size={20} /> : 'upload picture'}
          </Button>
        </Box>
      </Grid>
      <Grid xs={12} md={10} item className={classes.tabsContainer}>
        <Box textAlign="center">
          <Tabs
            value={value}
            variant="fullWidth"
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="IN PROGRESS" />
            <Tab label="COMPLETED" />
          </Tabs>
          <TabPanel value={value} index={0}>
            {openContests.length > 0 ? openContests : <div key="activeContest-1">No contests to display</div>}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {closedContests.length > 0 ? closedContests : <div key="inactiveContest-1">No contests to display</div>}
          </TabPanel>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Profile;
