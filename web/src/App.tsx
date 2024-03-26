import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'antd/dist/antd.css';
import './Styles/theme.less';
import './Styles/app.scss';
import Login from './Pages/Login/login';
import PrivateRoute from './Components/PrivateRoute/privateRoute';
import SignUp from './Pages/Signup/signup';
import CustomLayout from './Components/Layout/layout';
import AddUser from './Pages/Users/AddUser/addUser';
import UserManagement from './Pages/Users/UserManagement/userManagement';
import Dashboard from './Pages/Dashboard/dashboard';
import AddNewCompany from './Pages/Company/AddCompany/addNewCompany';
import CompanyManagement from './Pages/Company/CompanyManagement/companyManagement';
import 'mapbox-gl/dist/mapbox-gl.css';
import Homepage from './Pages/Homepage/homepage';
import PrivacyPolicy from './Pages/PrivacyPolicy/privacyPolicy';
import CodeOfConduct from './Pages/CodeofConduct/codeofConduct';
import CookiePolicy from './Pages/CookiePolicy/cookiePolicy';
import TermsOfUse from './Pages/TermsofUse/termsofUse';
import CarbonHelp from './Pages/Help/help';
import UserProfile from './Pages/Users/UserProfile/UserProfile';
import CompanyProfile from './Pages/Company/CompanyProfile/companyProfile';
import { AbilityContext } from './Casl/Can';
import { defineAbility, updateUserAbility } from './Casl/ability';
import {
  ConnectionContextProvider,
  UserInformationContextProvider,
  SettingsContextProvider,
} from '@undp/carbon-library';
import ReportSection from './Pages/OldComponents/ReportSection/reportsSection';
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

// message.config({
//   duration: 60,
// });

const App = () => {
  const ability = defineAbility();
  const enableRegistration = process.env.REACT_APP_ENABLE_REGISTRATION || 'true';
  const { i18n, t } = useTranslation(['common']);
  if (
    localStorage.getItem('companyId') &&
    localStorage.getItem('userRole') &&
    localStorage.getItem('userId') &&
    localStorage.getItem('companyState') &&
    localStorage.getItem('companyRole')
  )
    updateUserAbility(ability, {
      id: parseInt(localStorage.getItem('userId') as string),
      role: localStorage.getItem('userRole') as string,
      organisationId: parseInt(localStorage.getItem('companyId') as string),
      // companyState: parseInt(localStorage.getItem('companyState') as string),
      organisationType: localStorage.getItem('companyRole') as string,
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
                <Route path="resetPassword/:requestid" element={<Login resetPassword={true} />} />
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
                    <Route path="view/:id" element={<ActionForm method="view" />} />
                  </Route>
                  <Route path="/programmes" element={<CustomLayout selectedKey="programmes" />}>
                    <Route path="" element={<ProgrammeList />} />
                    <Route path="view/:id" element={<ProgrammeForm method="view" />} />
                    <Route path="add" element={<ProgrammeForm method="create" />} />
                  </Route>
                  <Route path="/projects" element={<CustomLayout selectedKey="projects" />}>
                    <Route path="" element={<ProjectList />} />
                    <Route path="view/:id" element={<ProjectForm />} />
                    <Route path="add" element={<ProjectForm />} />
                  </Route>

                  <Route path="/activities" element={<CustomLayout selectedKey="activities" />}>
                    <Route path="" element={<ActivityList />} />
                    <Route path="view/:id" element={<ActivityForm />} />
                    <Route path="add" element={<ActivityForm />} />
                  </Route>

                  <Route path="/support" element={<CustomLayout selectedKey="support" />}>
                    <Route path="" element={<SupportList />} />
                    <Route path="view/:id" element={<SupportForm />} />
                    <Route path="add" element={<SupportForm />} />
                  </Route>

                  <Route path="/reportings" element={<CustomLayout selectedKey="reportings" />}>
                    <Route index element={<ReportList />} />
                  </Route>

                  <Route path="/faqs" element={<CustomLayout selectedKey="faqs" />}>
                    <Route index element={<Faq />} />
                  </Route>

                  {/* <Route
                    path="/investmentManagement"
                    element={<CustomLayout selectedKey="investmentManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<InvestmentManagement />} />
                    <Route path="addInvestment" element={<AddInvestmentComponent />} />
                  </Route>
                  <Route
                    path="/supportManagement"
                    element={<CustomLayout selectedKey="supportManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<SupportManagement />} />
                    <Route path="addSupport" element={<AddSupportComponent />} />
                  </Route>
                  <Route
                    path="/ndcManagement"
                    element={<CustomLayout selectedKey="ndcManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<NdcActionManagement />} />
                    <Route path="view" element={<NdcActionView />} />
                  </Route>
                  <Route
                    path="/ndcDetails"
                    element={<CustomLayout selectedKey="ndcDetails/viewAll" />}
                  >
                    <Route path="viewAll" element={<NdcDetails />} />
                  </Route> */}
                  <Route
                    path="/companyManagement"
                    element={<CustomLayout selectedKey="companyManagement/viewAll" />}
                  >
                    <Route path="viewAll" element={<CompanyManagement />} />
                    <Route path="addCompany" element={<AddNewCompany />} />
                    <Route path="updateCompany" element={<AddNewCompany />} />
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
                  <Route
                    path="/companyProfile"
                    element={<CustomLayout selectedKey="companyManagement/viewAll" />}
                  >
                    <Route path="view" element={<CompanyProfile />} />
                  </Route>
                  <Route path="/reports" element={<CustomLayout selectedKey="reports" />}>
                    <Route index element={<ReportSection />} />
                  </Route>
                  {/* <Route
                      path="/userManagement"
                      element={<CustomLayout selectedKey="userManagement" />}
                    >
                      <Route index element={<UserManagement />} />
                      <Route path="addUser" element={<AddUser />} />
                      <Route path="updateUser" element={<UpdateUser />} />
                    </Route> */}
                </Route>
                {/* {enableRegistration === 'true' && (
                  <Route
                    path="registerCompany"
                    element={
                      <Suspense fallback={<Loading />}>
                        <RegisterNewCompany />
                      </Suspense>
                    }
                  />
                )} */}
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
