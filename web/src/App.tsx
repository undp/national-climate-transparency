import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { lazy } from 'react';

import 'antd/dist/antd.min.css';
import './Styles/theme.less';
import './Styles/app.scss';

import { AbilityContext } from './Casl/Can';
import { defineAbility, updateUserAbility } from './Casl/ability';
import { ConnectionContextProvider } from './Context/ConnectionContext/connectionContext';
import { UserInformationContextProvider } from './Context/UserInformationContext/userInformationContext';

// Eager Component Loading

import Login from './Pages/Login/login';
import PrivateRoute from './Components/PrivateRoute/privateRoute';
import CustomLayout from './Components/Layout/layout';
import AddUser from './Pages/Users/AddUser/addUser';
import UserManagement from './Pages/Users/UserManagement/userManagement';
import Dashboard from './Pages/Dashboard/dashboard';
import Homepage from './Pages/Homepage/homepage';
import ActionList from './Pages/Actions/ActionList/actionList';
import ProgrammeList from './Pages/Programmes/ProgrammeList/programmeList';
import ProjectList from './Pages/Projects/ProjectList/projectList';
import ActivityList from './Pages/Activities/ActivityList/activityList';
import SupportList from './Pages/Support/SupportList/supportList';
import ReportList from './Pages/Reporting/reportList';
import Faq from './Pages/Faq/faq';
import UserProfile from './Pages/Users/UserProfile/UserProfile';
import InfoLayout from './Components/Layout/infoLayout';

// Lazy Component Loading

const ActionForm = lazy(() => import('./Pages/Actions/ActionForm/actionForm'));
const ProgrammeForm = lazy(() => import('./Pages/Programmes/ProgrammeForm/programmeForm'));
const ProjectForm = lazy(() => import('./Pages/Projects/ProjectForm/projectForm'));
const ActivityForm = lazy(() => import('./Pages/Activities/ActivityForm/activityForm'));
const SupportForm = lazy(() => import('./Pages/Support/SupportForm/supportForm'));
const GhgEmissions = lazy(() => import('./Pages/Emissions/emissions'));
const GhgProjections = lazy(() => import('./Pages/Projections/projections'));
const GhgConfigurations = lazy(() => import('./Pages/Configurations/configurations'));
const TransparencyHelp = lazy(() => import('./Pages/InformationPages/Help/help'));
const TransparencyStatus = lazy(() => import('./Pages/InformationPages/Status/status'));
const PrivacyPolicy = lazy(() => import('./Pages/InformationPages/PrivacyPolicy/privacyPolicy'));
const CodeOfConduct = lazy(() => import('./Pages/InformationPages/CodeofConduct/codeofConduct'));
const CookiePolicy = lazy(() => import('./Pages/InformationPages/CookiePolicy/cookiePolicy'));
const TermsOfUse = lazy(() => import('./Pages/InformationPages/TermsofUse/termsofUse'));

const App = () => {
  const ability = defineAbility();
  const { t } = useTranslation(['common']);

  // Setting up User Information Context

  if (localStorage.getItem('userRole') && localStorage.getItem('userId')) {
    updateUserAbility(ability, {
      id: parseInt(localStorage.getItem('userId') as string),
      role: localStorage.getItem('userRole') as string,
    });
  }

  return (
    <AbilityContext.Provider value={ability}>
      <ConnectionContextProvider
        serverURL={
          process.env.REACT_APP_BACKEND ? process.env.REACT_APP_BACKEND : 'http://localhost:9000'
        }
        t={t}
        statServerUrl={
          process.env.REACT_APP_STAT_URL ? process.env.REACT_APP_STAT_URL : 'http://localhost:9100'
        }
      >
        <UserInformationContextProvider>
          <BrowserRouter>
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<Homepage />} />

              {/* Authentication Routes */}
              <Route path="login" element={<Login />} />
              <Route path="forgotPassword" element={<Login forgotPassword={true} />} />
              <Route path="resetPassword/:requestId" element={<Login resetPassword={true} />} />

              {/* Information Page Routes */}
              <Route path="/info" element={<InfoLayout />}>
                <Route path="help" element={<TransparencyHelp />} />
                <Route path="status" element={<TransparencyStatus />} />
                <Route path="cookie" element={<CookiePolicy />} />
                <Route path="codeOfConduct" element={<CodeOfConduct />} />
                <Route path="termsOfUse" element={<TermsOfUse />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/" element={<PrivateRoute />}>
                <Route path="/dashboard" element={<CustomLayout selectedKey="dashboard" />}>
                  <Route index element={<Dashboard />} />
                </Route>
                <Route path="/actions" element={<CustomLayout selectedKey="actions" />}>
                  <Route path="" element={<ActionList />} />
                  <Route path="add" element={<ActionForm method="create" />} />
                  <Route path="edit/:entId" element={<ActionForm method="update" />} />
                  <Route path="view/:entId" element={<ActionForm method="view" />} />
                </Route>
                <Route path="/programmes" element={<CustomLayout selectedKey="programmes" />}>
                  <Route path="" element={<ProgrammeList />} />
                  <Route path="add" element={<ProgrammeForm method="create" />} />
                  <Route path="edit/:entId" element={<ProgrammeForm method="update" />} />
                  <Route path="view/:entId" element={<ProgrammeForm method="view" />} />
                </Route>
                <Route path="/projects" element={<CustomLayout selectedKey="projects" />}>
                  <Route path="" element={<ProjectList />} />
                  <Route path="add" element={<ProjectForm method="create" />} />
                  <Route path="edit/:entId" element={<ProjectForm method="update" />} />
                  <Route path="view/:entId" element={<ProjectForm method="view" />} />
                </Route>
                <Route path="/activities" element={<CustomLayout selectedKey="activities" />}>
                  <Route path="" element={<ActivityList />} />
                  <Route path="add" element={<ActivityForm method="create" />} />
                  <Route path="edit/:entId" element={<ActivityForm method="update" />} />
                  <Route path="view/:entId" element={<ActivityForm method="view" />} />
                </Route>
                <Route path="/support" element={<CustomLayout selectedKey="support" />}>
                  <Route path="" element={<SupportList />} />
                  <Route path="add" element={<SupportForm method="create" />} />
                  <Route path="edit/:entId" element={<SupportForm method="update" />} />
                  <Route path="view/:entId" element={<SupportForm method="view" />} />
                </Route>
                <Route path="/emissions" element={<CustomLayout selectedKey="emissions" />}>
                  <Route index element={<GhgEmissions />} />
                </Route>
                <Route path="/projections" element={<CustomLayout selectedKey="projections" />}>
                  <Route index element={<GhgProjections />} />
                </Route>
                <Route
                  path="/configurations"
                  element={<CustomLayout selectedKey="configurations" />}
                >
                  <Route index element={<GhgConfigurations />} />
                </Route>
                <Route path="/reportings" element={<CustomLayout selectedKey="reportings" />}>
                  <Route index element={<ReportList />} />
                </Route>
                <Route path="/faqs" element={<CustomLayout selectedKey="faqs" />}>
                  <Route index element={<Faq />} />
                </Route>
                <Route
                  path="/userManagement"
                  element={<CustomLayout selectedKey="userManagement/viewAll" />}
                >
                  <Route path="viewAll" element={<UserManagement />} />
                  <Route path="addUser" element={<AddUser />} />
                  <Route path="updateUser" element={<AddUser />} />
                </Route>
                <Route
                  path="/userProfile"
                  element={<CustomLayout selectedKey="userManagement/viewAll" />}
                >
                  <Route path="view" element={<UserProfile />} />
                </Route>
              </Route>

              {/* Not Found Redirect */}
              <Route path="/*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UserInformationContextProvider>
      </ConnectionContextProvider>
    </AbilityContext.Provider>
  );
};

export default App;
