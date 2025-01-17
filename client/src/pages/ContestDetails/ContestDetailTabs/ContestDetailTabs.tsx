// Adapted from https://material-ui.com/components/tabs/

import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useTheme } from '@material-ui/core/styles';
import useStyles from './useStyles';
import { SubmissionsGrid, submissionCount } from './SubmissionsList';
import { Submission } from '../../../interface/Submission';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

interface SubmissionListProps {
  submissionList: Submission[];
  description: string;
  setWinner: (submissionId: string) => void;
}

function TabPanel(props: TabPanelProps) {
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
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs({ submissionList, description, setWinner }: SubmissionListProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const getCount = (submissionList: Submission[]) => {
    return submissionList.length > 0 ? submissionCount({ submissionList }) : 0;
  };
  const count = getCount(submissionList);
  const handleChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label={`Designs (${count})`} {...a11yProps(0)} />
          <Tab label="Brief" {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
        className={classes.panel}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          {count > 0 ? <SubmissionsGrid submissionList={submissionList} setWinner={setWinner} /> : <></>}
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <Typography variant="body1" className={classes.description}>
            {description}
          </Typography>
        </TabPanel>
      </SwipeableViews>
    </div>
  );
}
