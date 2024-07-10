import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'antd/dist/antd.min.css';
import './Styles/theme.less';
import './Styles/app.scss';
import Login from './Pages/Login/login';
import PrivateRoute from './Components/PrivateRoute/privateRoute';
import SignUp from './Pages/Signup/signup';
import CustomLayout from './Components/Layout/layout';
import AddUser from './Pages/Users/AddUser/addUser';
import UserManagement from './Pages/Users/UserManagement/userManagement';
import Dashboard from './Pages/Dashboard/dashboard';
import 'mapbox-gl/dist/mapbox-gl.css';
import Homepage from './Pages/Homepage/homepage';
import PrivacyPolicy from './Pages/PrivacyPolicy/privacyPolicy';
import CodeOfConduct from './Pages/CodeofConduct/codeofConduct';
import CookiePolicy from './Pages/CookiePolicy/cookiePolicy';
import TermsOfUse from './Pages/TermsofUse/termsofUse';
import CarbonHelp from './Pages/Help/help';
import UserProfile from './Pages/Users/UserProfile/UserProfile';
import { AbilityContext } from './Casl/Can';
import { defineAbility, updateUserAbility } from './Casl/ability';
import { useTranslation } from 'react-i18next';
import ActionList from './Pages/Actions/ActionList/actionList';
import ActionForm from './Pages/Actions/ActionForm/actionForm';
import ProgrammeList from './Pages/Programmes/ProgrammeList/programmeList';
import ProgrammeForm from './Pages/Programmes/ProgrammeForm/programmeForm';
import ProjectList from './Pages/Projects/ProjectList/projectList';
import ProjectForm from './Pages/Projects/ProjectForm/projectForm';
import ActivityList from './Pages/Activities/ActivityList/activityList';
import ActivityForm from './Pages/Activities/ActivityForm/activityForm';
import SupportList from './Pages/Support/SupportList/supportList';
import SupportForm from './Pages/Support/SupportForm/supportForm';
import ReportList from './Pages/Reporting/reportList';
import Faq from './Pages/Faq/faq';
import { ConnectionContextProvider } from './Context/ConnectionContext/connectionContext';
import { UserInformationContextProvider } from './Context/UserInformationContext/userInformationContext';
import { SettingsContextProvider } from './Context/SettingsContext/settingsContext';
import GhgEmissions from './Pages/Emissions/emissions';
import GhgProjections from './Pages/Projections/projections';
import GhgConfigurations from './Pages/Configurations/configurations';

const App = () => {
  const ability = defineAbility();
  const { t } = useTranslation(['common']);
  if (localStorage.getItem('userRole') && localStorage.getItem('userId'))
    updateUserAbility(ability, {
      id: parseInt(localStorage.getItem('userId') as string),
      role: localStorage.getItem('userRole') as string,
    });
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
          <SettingsContextProvider>
            <BrowserRouter>
              <Routes>
                <Route path="login" element={<Login />} />
                <Route path="forgotPassword" element={<Login forgotPassword={true} />} />
                <Route path="resetPassword/:requestId" element={<Login resetPassword={true} />} />
                <Route path="signUp" element={<SignUp />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="help" element={<CarbonHelp />} />
                <Route path="codeconduct" element={<CodeOfConduct />} />
                <Route path="cookie" element={<CookiePolicy />} />
                <Route path="terms" element={<TermsOfUse />} />
                <Route path="/" element={<Homepage />} />
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
                <Route path="/*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </SettingsContextProvider>
        </UserInformationContextProvider>
      </ConnectionContextProvider>
    </AbilityContext.Provider>
  );
};

export default App;
