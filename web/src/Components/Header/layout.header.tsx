import './layout.header.scss';
import { useNavigate } from 'react-router-dom';
import thumbnail from '../../Assets/Images/thumbnail.png';
import { PersonCircle } from 'react-bootstrap-icons';

const LayoutHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="header-container">
      <div className="header-prof">
        <div className="header-country-logo">
          <PersonCircle
            color="#3A354199"
            style={{ cursor: 'pointer' }}
            size={44}
            onClick={() => {
              navigate('/userProfile/view');
            }}
          />
        </div>
        <img src={thumbnail} alt="thumbnail" style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default LayoutHeader;
