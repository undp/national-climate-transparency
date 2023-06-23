import { Checkbox, Col, Form, Row } from 'antd';
import React, { useState } from 'react';
import goal1 from '../../Assets/Images/SdgGoalsImages/goal-1.jpg';
import goal2 from '../../Assets/Images/SdgGoalsImages/goal-2.jpg';
import goal3 from '../../Assets/Images/SdgGoalsImages/goal-3.jpg';
import goal4 from '../../Assets/Images/SdgGoalsImages/goal-4.jpg';
import goal5 from '../../Assets/Images/SdgGoalsImages/goal-5.jpg';
import goal6 from '../../Assets/Images/SdgGoalsImages/goal-6.jpg';
import goal7 from '../../Assets/Images/SdgGoalsImages/goal-7.jpg';
import goal8 from '../../Assets/Images/SdgGoalsImages/goal-8.jpg';
import goal9 from '../../Assets/Images/SdgGoalsImages/goal-9.jpg';
import goal10 from '../../Assets/Images/SdgGoalsImages/goal-10.jpg';
import goal11 from '../../Assets/Images/SdgGoalsImages/goal-11.jpg';
import goal12 from '../../Assets/Images/SdgGoalsImages/goal-12.jpg';
import goal13 from '../../Assets/Images/SdgGoalsImages/goal-13.jpg';
import goal14 from '../../Assets/Images/SdgGoalsImages/goal-14.jpg';
import goal15 from '../../Assets/Images/SdgGoalsImages/goal-15.jpg';
import goal16 from '../../Assets/Images/SdgGoalsImages/goal-16.jpg';
import goal17 from '../../Assets/Images/SdgGoalsImages/goal-17.jpg';

import goal1Seletced from '../../Assets/Images/SdgGoalsImages/goal-1-selected.jpg';
import goal2Seletced from '../../Assets/Images/SdgGoalsImages/goal-2-selected.jpg';
import goal3Seletced from '../../Assets/Images/SdgGoalsImages/goal-3-selected.jpg';
import goal4Seletced from '../../Assets/Images/SdgGoalsImages/goal-4-selected.jpg';
import goal5Seletced from '../../Assets/Images/SdgGoalsImages/goal-5-selected.jpg';
import goal6Seletced from '../../Assets/Images/SdgGoalsImages/goal-6-selected.jpg';
import goal7Seletced from '../../Assets/Images/SdgGoalsImages/goal-7-selected.jpg';
import goal8Seletced from '../../Assets/Images/SdgGoalsImages/goal-8-selected.jpg';
import goal9Seletced from '../../Assets/Images/SdgGoalsImages/goal-9-selected.jpg';
import goal10Seletced from '../../Assets/Images/SdgGoalsImages/goal-10-selected.jpg';
import goal11Seletced from '../../Assets/Images/SdgGoalsImages/goal-11-selected.jpg';
import goal12Seletced from '../../Assets/Images/SdgGoalsImages/goal-12-selected.jpg';
import goal13Seletced from '../../Assets/Images/SdgGoalsImages/goal-13-selected.jpg';
import goal14Seletced from '../../Assets/Images/SdgGoalsImages/goal-14-selected.jpg';
import goal15Seletced from '../../Assets/Images/SdgGoalsImages/goal-15-selected.jpg';
import goal16Seletced from '../../Assets/Images/SdgGoalsImages/goal-16-selected.jpg';
import goal17Seletced from '../../Assets/Images/SdgGoalsImages/goal-17-selected.jpg';
const sdgGoalsDetails = [
  {
    name: 'noPoverty',
    image: goal1,
  },
  {
    name: 'zeroHunger',
    image: goal2,
  },
  {
    name: 'gdHealth',
    image: goal3,
  },
  {
    name: 'qualityEducation',
    image: goal4,
  },
  {
    name: 'genderEq',
    image: goal5,
  },
  {
    name: 'cleanWatr',
    image: goal6,
  },
  {
    name: 'affEnergy',
    image: goal7,
  },
  {
    name: 'decentWork',
    image: goal8,
  },
  {
    name: 'industry',
    image: goal9,
  },
  {
    name: 'reducedInEq',
    image: goal10,
  },
  {
    name: 'sustainableCities',
    image: goal11,
  },
  {
    name: 'responsibleConsumption',
    image: goal12,
  },
  {
    name: 'climateAction',
    image: goal13,
  },
  {
    name: 'lifeBelowWater',
    image: goal14,
  },
  {
    name: 'lifeOnLand',
    image: goal15,
  },
  {
    name: 'peace',
    image: goal16,
  },
  {
    name: 'partnership',
    image: goal17,
  },
];

const SdgGoals = () => {
  const [formOne] = Form.useForm();
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [sdgGoals, setSdgGoals] = useState<any[]>(sdgGoalsDetails);

  const handleImageSelect = (imageId: any, image: any) => {
    setSelectedImageId(imageId);
  };

  return (
    <div className="co-benifits-tab-item">
      <Form
        name="sdg-goals-details"
        className="benifits-details-sdg-goals"
        form={formOne}
        onFinish={() => {}}
      >
        <Row gutter={[5, 16]} className="row">
          {sdgGoalsDetails?.map((sdgGoal: any) => (
            <Col sm={12} md={12} lg={4} xl={4} className="col">
              <div className="img-container">
                <Form.Item name="images">
                  <img
                    src={sdgGoal?.image}
                    alt={`Image ${sdgGoal?.name}`}
                    className={selectedImageId === sdgGoal?.name ? 'selected' : ''}
                    onClick={() => handleImageSelect(sdgGoal?.name, sdgGoal?.image)}
                  />
                </Form.Item>
              </div>
            </Col>
          ))}
        </Row>
      </Form>
    </div>
  );
};

export default SdgGoals;
