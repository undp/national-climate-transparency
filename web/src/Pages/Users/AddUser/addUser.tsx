import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConnection, useUserContext } from '@undp/carbon-library';
import { useAbilityContext } from '../../../Casl/Can';
import { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Input, message, Tooltip, Skeleton, Radio, Select } from 'antd';
import PhoneInput, {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isPossiblePhoneNumber,
} from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './addNewUserComponent.scss';
import '../../../Styles/app.scss';
import { Action } from '../../../Enums/action.enum';
import { plainToClass } from 'class-transformer';
import { User } from '../../../Entities/user';
import ChangePasswordModel from '../../../Components/Models/changePasswordModel';
import { Role } from '../../../Enums/role.enum';
import { BankOutlined, ExperimentOutlined, EyeOutlined, StarOutlined } from '@ant-design/icons';
import { OrganisationType } from '../../../Definitions/organisation.type.enum';

const AddUser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['addUser', 'passwordReset', 'userProfile']);
  const themeColor = '#9155fd';

  const onNavigateToUserManagement = () => {
    navigate('/userManagement/viewAll', { replace: true });
  };

  const onNavigateToLogin = () => {
    navigate('/login', { replace: true });
  };

  const { post, put, delete: del, get } = useConnection();
  const [formOne] = Form.useForm();
  const { state } = useLocation();
  const { updateToken } = useConnection();
  const { removeUserInfo } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [actionInfo, setActionInfo] = useState<any>({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [openPasswordChangeModal, setopenPasswordChangeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<any>('');
  const { userInfoState } = useUserContext();
  const ability = useAbilityContext();
  const [countries, setCountries] = useState<[]>([]);
  const [isCountryListLoading, setIsCountryListLoading] = useState(false);
  const [organisationType, setOrganisationType] = useState(state?.record?.organisationType);
  const [orgList, setOrgList] = useState<Record<number, string>>([]);
  const [governmentInfo, setGovernmentInfo] = useState<any>();

  const getCountryList = async () => {
    setIsCountryListLoading(true);
    try {
      const response = await get('national/organisation/countries');
      if (response.data) {
        const alpha2Names = response.data.map((item: any) => {
          return item.alpha2;
        });
        setCountries(alpha2Names);
      }
    } catch (error: any) {
      console.log('Error in getCountryList', error);
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setIsCountryListLoading(false);
    }
  };

  const onAddUser = async (values: any) => {
    setLoading(true);
    try {
      if (values.phoneNo && values.phoneNo.length > 4) {
        values.phoneNo = formatPhoneNumberIntl(values.phoneNo);
      } else {
        values.phoneNo = undefined;
      }
      if (organisationType === OrganisationType.GOVERNMENT) {
        values.organisationId = governmentInfo?.organisationId;
      } else {
        values.organisationId = parseInt(values.department);
        values.role = Role.DepartmentUser;
      }
      const response = await post('national/user/add', values);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('addUserSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToUserManagement();
        setLoading(false);
      }
    } catch (error: any) {
      console.log('Error in user creation', error);
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateUser = async () => {
    setLoading(true);
    const formOneValues = formOne.getFieldsValue();
    formOneValues.phoneNo = formatPhoneNumberIntl(formOneValues.phoneNo);
    try {
      const values: any = {
        id: state?.record?.id,
        name: formOneValues?.name,
        phoneNo: formOneValues?.phoneNo,
      };

      if (ability.can(Action.Update, plainToClass(User, state?.record), 'role'))
        values.role = formOneValues?.role;

      if (ability.can(Action.Update, plainToClass(User, state?.record), 'email'))
        values.email = formOneValues?.email;

      console.log('form one values   -- > ', values, state.record);
      const response = await put('national/user/update', values);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('updateUserSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        onNavigateToUserManagement();
        state.record = {};
        setLoading(false);
      }
    } catch (error: any) {
      console.log('Error in user update', error);
      message.open({
        type: 'error',
        content: `${t('updateUserError')} ${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setLoading(false);
    }
  };

  const onSubmitData = async (values: any) => {
    if (isUpdate) onUpdateUser();
    else onAddUser(values);
  };

  const signOut = (): void => {
    onNavigateToLogin();
    updateToken();
    removeUserInfo();
  };

  const onPasswordChangeCompleted = async (props: any) => {
    setIsLoading(true);
    try {
      const response = await put('national/user/resetPassword', {
        newPassword: props.newPassword,
        oldPassword: props.oldPassword,
      });
      const responseMsg = response.message;
      setopenPasswordChangeModal(false);
      message.open({
        type: 'success',
        content: responseMsg,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
      setErrorMsg('');
      signOut();
    } catch (exception: any) {
      setErrorMsg(exception.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangedPassword = () => {
    setErrorMsg('');
    setopenPasswordChangeModal(true);
  };

  const onPasswordChangeCanceled = () => {
    setopenPasswordChangeModal(false);
  };

  const onFormsValueChanged = async () => {
    setErrorMsg('');
  };

  const onChangeOrganisationType = (event: any) => {
    const value = event.target.value;
    setOrganisationType(value);
  };

  const getDepartments = async () => {
    setLoadingList(true);
    try {
      const response = await post('national/organisation/query', {
        filterAnd: [
          {
            key: 'organisationType',
            operation: '=',
            value: 'Department',
          },
        ],
      });
      if (response.data) {
        const orgNamesMap: Record<number, string> = response.data.reduce(
          (acc: Record<number, string>, item: any) => {
            acc[item.organisationId] = item.name;
            return acc;
          },
          {}
        );
        // const uniqueRegionNames: any = Array.from(new Set(regionNames));
        setOrgList(orgNamesMap);
      }
    } catch (error: any) {
      console.log('Error in getting organisation list', error);
    } finally {
      setLoadingList(false);
    }
  };

  const getGovernment = async () => {
    setLoadingList(true);
    try {
      const response = await post('national/organisation/query', {
        filterAnd: [
          {
            key: 'organisationType',
            operation: '=',
            value: 'Government',
          },
        ],
      });
      if (response.data) {
        setGovernmentInfo(response.data[0]);
      }
    } catch (error: any) {
      console.log('Error in getting government information', error);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    getCountryList();
    getDepartments();
    getGovernment();
    setIsUpdate(state?.record ? true : false);
  }, []);

  return (
    <div className="add-user-main-container">
      <div className="title-container">
        <div className="titles">
          <div className="main">{isUpdate ? t('addUser:editUser') : t('addUser:addNewUser')}</div>
          <div className="sub">
            {state?.record?.name ? t('addUser:editUserSub') : t('addUser:addUserSub')}
          </div>
        </div>
        {isUpdate &&
          userInfoState?.id === state?.record?.id &&
          !ability.can(Action.Update, plainToClass(User, state?.record), 'email') && (
            <div className="actions">
              <Button className="mg-left-1" type="primary" onClick={onChangedPassword}>
                {t('userProfile:changePassword')}
              </Button>
            </div>
          )}
      </div>
      <div className="content-card user-content-card">
        <Form
          name="user-details"
          className="user-details-form"
          layout="vertical"
          form={formOne}
          requiredMark={true}
          onFinish={onSubmitData}
        >
          <Row className="row" gutter={[16, 16]}>
            <Col xl={12} md={24}>
              <div className="details-part-one">
                <Form.Item
                  label={t('addUser:name')}
                  initialValue={state?.record?.name}
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '',
                    },
                    {
                      validator: async (rule, value) => {
                        if (
                          String(value).trim() === '' ||
                          String(value).trim() === undefined ||
                          value === null ||
                          value === undefined
                        ) {
                          throw new Error(`${t('addUser:name')} ${t('addUser:isRequired')}`);
                        }
                      },
                    },
                  ]}
                >
                  <Input size="large" />
                </Form.Item>
                <Form.Item
                  label={t('addUser:email')}
                  name="email"
                  initialValue={state?.record?.email}
                  rules={[
                    {
                      required: true,
                      message: '',
                    },
                    {
                      validator: async (rule, value) => {
                        if (
                          String(value).trim() === '' ||
                          String(value).trim() === undefined ||
                          value === null ||
                          value === undefined
                        ) {
                          throw new Error(`${t('addUser:email')} ${t('addUser:isRequired')}`);
                        } else {
                          const val = value.trim();
                          const reg =
                            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                          const matches = val.match(reg) ? val.match(reg) : [];
                          if (matches.length === 0) {
                            throw new Error(`${t('addUser:email')} ${t('addUser:isInvalid')}`);
                          }
                        }
                      },
                    },
                  ]}
                >
                  <Input
                    disabled={
                      isUpdate &&
                      !ability.can(Action.Update, plainToClass(User, state?.record), 'email')
                    }
                    size="large"
                  />
                </Form.Item>
                <Skeleton loading={isCountryListLoading} active>
                  {countries.length > 0 && (
                    <Form.Item
                      name="phoneNo"
                      label={t('addUser:phoneNo')}
                      initialValue={state?.record?.phoneNo}
                      rules={[
                        {
                          required: false,
                        },
                        {
                          validator: async (rule: any, value: any) => {
                            const phoneNo = formatPhoneNumber(String(value));
                            if (String(value).trim() !== '') {
                              if (
                                (String(value).trim() !== '' &&
                                  String(value).trim() !== undefined &&
                                  value !== null &&
                                  value !== undefined &&
                                  phoneNo !== null &&
                                  phoneNo !== '' &&
                                  phoneNo !== undefined &&
                                  !isPossiblePhoneNumber(String(value))) ||
                                value?.length > 17
                              ) {
                                throw new Error(`${t('addUser:phoneNo')} ${t('isInvalid')}`);
                              }
                            }
                          },
                        },
                      ]}
                    >
                      <PhoneInput
                        placeholder={t('addUser:phoneNo')}
                        international
                        // value={contactNoInput}
                        defaultCountry="LK"
                        countryCallingCodeEditable={false}
                        onChange={(v) => {}}
                        countries={countries}
                      />
                    </Form.Item>
                  )}
                </Skeleton>
              </div>
            </Col>
            <Col xl={12} md={24}>
              <div className="details-part-two">
                <Form.Item
                  className="role-group"
                  label={t('addUser:organisationType')}
                  initialValue={state?.record?.organisationType}
                  name="organisationType"
                  rules={[
                    {
                      required: true,
                      message: `${t('addUser:organisationType')} ${t('addUser:isRequired')}`,
                    },
                  ]}
                >
                  <Radio.Group
                    value={state?.record?.organisationType}
                    size="large"
                    disabled={
                      isUpdate &&
                      !ability.can(
                        Action.Update,
                        plainToClass(User, state?.record),
                        'organisationType'
                      )
                    }
                    onChange={onChangeOrganisationType}
                  >
                    <div className="government-radio-container">
                      {/* <Tooltip placement="top" title={t('addUser:adminToolTip')}> */}
                      <Radio.Button className="government" value="Government">
                        <BankOutlined className="role-icons" />
                        {t('addUser:government')}
                      </Radio.Button>
                      {/* </Tooltip> */}
                    </div>
                    <div className="department-radio-container">
                      {/* <Tooltip placement="top" title={t('addUser:viewerToolTip')}> */}
                      <Radio.Button className="department" value="Department">
                        <ExperimentOutlined className="role-icons" />
                        {t('addUser:department')}
                      </Radio.Button>
                      {/* </Tooltip> */}
                    </div>
                  </Radio.Group>
                </Form.Item>

                {organisationType === OrganisationType.GOVERNMENT && (
                  <Form.Item
                    className="role-group"
                    label={t('addUser:role')}
                    initialValue={state?.record?.role}
                    name="role"
                    rules={[
                      {
                        required: true,
                        message: `${t('addUser:role')} ${t('addUser:isRequired')}`,
                      },
                    ]}
                  >
                    <Radio.Group
                      value={state?.record?.role}
                      size="large"
                      disabled={
                        isUpdate &&
                        !ability.can(Action.Update, plainToClass(User, state?.record), 'role')
                      }
                    >
                      <div className="admin-radio-container">
                        <Tooltip placement="top" title={t('addUser:adminToolTip')}>
                          <Radio.Button className="admin" value="Admin">
                            <StarOutlined className="role-icons" />
                            {t('addUser:admin')}
                          </Radio.Button>
                        </Tooltip>
                      </div>
                      <div className="view-only-radio-container">
                        <Tooltip placement="top" title={t('addUser:viewerToolTip')}>
                          <Radio.Button className="view-only" value="ViewOnly">
                            <EyeOutlined className="role-icons" />
                            {t('addUser:observer')}
                          </Radio.Button>
                        </Tooltip>
                      </div>
                    </Radio.Group>
                  </Form.Item>
                )}
                {organisationType === OrganisationType.DEPARTMENT && (
                  <Form.Item
                    label={t('addUser:department')}
                    name="department"
                    initialValue={state?.record?.organisation?.name}
                    rules={[
                      {
                        required: true,
                        message: `${t('addCompany:department')} ${t('isRequired')}`,
                      },
                    ]}
                  >
                    <Select size="large" loading={loadingList}>
                      {Object.keys(orgList).map((orgId: any) => {
                        const orgName = orgList[orgId];
                        return (
                          <Select.Option
                            key={orgId}
                            value={orgId}
                            selected={orgId === state?.record?.organisationId}
                          >
                            {orgName}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                )}
              </div>
            </Col>
          </Row>
          <div className="actions">
            <Form.Item>
              <div className="create-user-btn-container">
                <Button type="primary" htmlType="submit" loading={loading}>
                  {isUpdate ? t('addUser:update') : t('addUser:submit')}
                </Button>
              </div>
            </Form.Item>
          </div>
        </Form>
      </div>
      <ChangePasswordModel
        t={t}
        onPasswordChanged={onPasswordChangeCompleted}
        onFieldsChanged={onFormsValueChanged}
        onCanceled={onPasswordChangeCanceled}
        openModal={openPasswordChangeModal}
        errorMsg={errorMsg}
        loadingBtn={isLoading}
        themeColor={themeColor}
      ></ChangePasswordModel>
    </div>
  );
};

export default AddUser;
