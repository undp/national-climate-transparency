import { Checkbox, Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
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
    selected: false,
  },
  {
    name: 'zeroHunger',
    image: goal2,
    selected: false,
  },
  {
    name: 'gdHealth',
    image: goal3,
    selected: false,
  },
  {
    name: 'qualityEducation',
    image: goal4,
    selected: false,
  },
  {
    name: 'genderEq',
    image: goal5,
    selected: false,
  },
  {
    name: 'cleanWatr',
    image: goal6,
    selected: false,
  },
  {
    name: 'affEnergy',
    image: goal7,
    selected: false,
  },
  {
    name: 'decentWork',
    image: goal8,
    selected: false,
  },
  {
    name: 'industry',
    image: goal9,
    selected: false,
  },
  {
    name: 'reducedInEq',
    image: goal10,
    selected: false,
  },
  {
    name: 'sustainableCities',
    image: goal11,
    selected: false,
  },
  {
    name: 'responsibleConsumption',
    image: goal12,
    selected: false,
  },
  {
    name: 'climateAction',
    image: goal13,
    selected: false,
  },
  {
    name: 'lifeBelowWater',
    image: goal14,
    selected: false,
  },
  {
    name: 'lifeOnLand',
    image: goal15,
    selected: false,
  },
  {
    name: 'peace',
    image: goal16,
    selected: false,
  },
  {
    name: 'partnership',
    image: goal17,
    selected: false,
  },
];

const SdgGoals = () => {
  const [formOne] = Form.useForm();
  const [sdgGoals, setSdgGoals] = useState<any[]>(sdgGoalsDetails);

  const returnSelectedImage = (image: any) => {
    switch (image) {
      case goal1:
        return goal1Seletced;
      case goal2:
        return goal2Seletced;
      case goal3:
        return goal3Seletced;
      case goal4:
        return goal4Seletced;
      case goal5:
        return goal5Seletced;
      case goal6:
        return goal6Seletced;
      case goal7:
        return goal7Seletced;
      case goal8:
        return goal8Seletced;
      case goal9:
        return goal9Seletced;
      case goal10:
        return goal10Seletced;
      case goal11:
        return goal11Seletced;
      case goal12:
        return goal12Seletced;
      case goal13:
        return goal13Seletced;
      case goal14:
        return goal14Seletced;
      case goal15:
        return goal15Seletced;
      case goal16:
        return goal16Seletced;
      case goal17:
        return goal17Seletced;
      case goal1Seletced:
        return goal1;
      case goal2Seletced:
        return goal2;
      case goal3Seletced:
        return goal3;
      case goal4Seletced:
        return goal4;
      case goal5Seletced:
        return goal5;
      case goal6Seletced:
        return goal6;
      case goal7Seletced:
        return goal7;
      case goal8Seletced:
        return goal8;
      case goal9Seletced:
        return goal9;
      case goal10Seletced:
        return goal10;
      case goal11Seletced:
        return goal11;
      case goal12Seletced:
        return goal12;
      case goal13Seletced:
        return goal13;
      case goal14Seletced:
        return goal14;
      case goal15Seletced:
        return goal15;
      case goal16Seletced:
        return goal16;
      case goal17Seletced:
        return goal17;
      default:
        return image;
    }
  };

  const handleImageSelect = (imageId: any, image: any) => {
    setSdgGoals((goals) =>
      goals.map((goal) =>
        goal.name === imageId
          ? {
              ...goal,
              selected: !goal.selected,
              image: returnSelectedImage(goal?.image),
            }
          : goal
      )
    );
  };

  useEffect(() => {
    console.log('sdg goals changes ------------- > ');
    console.log(sdgGoals);
  }, [sdgGoals]);

  return (
    <div className="co-benifits-tab-item">
      <Form name="sdg-goals-details" className="benifits-details-sdg-goals" form={formOne}>
        <Row gutter={[5, 16]} className="row">
          {sdgGoals?.map((sdgGoal: any) => (
            <Col sm={12} md={12} lg={4} xl={4} className="col">
              <div className="img-container">
                <Form.Item name="images">
                  <img
                    src={sdgGoal?.image}
                    alt={`Image ${sdgGoal?.name}`}
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
