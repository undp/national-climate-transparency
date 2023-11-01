import { ProgrammeCreationComponent } from '@undp/carbon-library';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ghgInventory.scss';
import GHGImg from '../../Assets/Images/ghg-img.png';

const GHGInventory = () => {
  return (
    <div className="inventory-section">
      <div className="img-container">
        <img src={GHGImg} alt="ghg-img" />
      </div>
    </div>
  );
};

export default GHGInventory;
