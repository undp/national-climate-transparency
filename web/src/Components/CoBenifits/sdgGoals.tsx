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

import goal1Selected from '../../Assets/Images/SdgGoalsImages/goal-1-selected.jpg';
import goal2Selected from '../../Assets/Images/SdgGoalsImages/goal-2-selected.jpg';
import goal3Selected from '../../Assets/Images/SdgGoalsImages/goal-3-selected.jpg';
import goal4Selected from '../../Assets/Images/SdgGoalsImages/goal-4-selected.jpg';
import goal5Selected from '../../Assets/Images/SdgGoalsImages/goal-5-selected.jpg';
import goal6Selected from '../../Assets/Images/SdgGoalsImages/goal-6-selected.jpg';
import goal7Selected from '../../Assets/Images/SdgGoalsImages/goal-7-selected.jpg';
import goal8Selected from '../../Assets/Images/SdgGoalsImages/goal-8-selected.jpg';
import goal9Selected from '../../Assets/Images/SdgGoalsImages/goal-9-selected.jpg';
import goal10Selected from '../../Assets/Images/SdgGoalsImages/goal-10-selected.jpg';
import goal11Selected from '../../Assets/Images/SdgGoalsImages/goal-11-selected.jpg';
import goal12Selected from '../../Assets/Images/SdgGoalsImages/goal-12-selected.jpg';
import goal13Selected from '../../Assets/Images/SdgGoalsImages/goal-13-selected.jpg';
import goal14Selected from '../../Assets/Images/SdgGoalsImages/goal-14-selected.jpg';
import goal15Selected from '../../Assets/Images/SdgGoalsImages/goal-15-selected.jpg';
import goal16Selected from '../../Assets/Images/SdgGoalsImages/goal-16-selected.jpg';
import goal17Selected from '../../Assets/Images/SdgGoalsImages/goal-17-selected.jpg';
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

  const goalImageMap = {
    [goal1]: goal1Selected,
    [goal2]: goal2Selected,
    [goal3]: goal3Selected,
    [goal4]: goal4Selected,
    [goal5]: goal5Selected,
    [goal6]: goal6Selected,
    [goal7]: goal7Selected,
    [goal8]: goal8Selected,
    [goal9]: goal9Selected,
    [goal10]: goal10Selected,
    [goal11]: goal11Selected,
    [goal12]: goal12Selected,
    [goal13]: goal13Selected,
    [goal14]: goal14Selected,
    [goal15]: goal15Selected,
    [goal16]: goal16Selected,
    [goal17]: goal17Selected,
    [goal1Selected]: goal1,
    [goal2Selected]: goal2,
    [goal3Selected]: goal3,
    [goal4Selected]: goal4,
    [goal5Selected]: goal5,
    [goal6Selected]: goal6,
    [goal7Selected]: goal7,
    [goal8Selected]: goal8,
    [goal9Selected]: goal9,
    [goal10Selected]: goal10,
    [goal11Selected]: goal11,
    [goal12Selected]: goal12,
    [goal13Selected]: goal13,
    [goal14Selected]: goal14,
    [goal15Selected]: goal15,
    [goal16Selected]: goal16,
    [goal17Selected]: goal17,
  };

  const returnSelectedImage = (image: any) => {
    if (goalImageMap.hasOwnProperty(image)) {
      return goalImageMap[image];
    }
    return image;
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
