import { Col, Form, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { SdgGoals as SdgGoalsEnum } from '../../Casl/enums/sdgGoals.enum';
import goal1 from '../../Assets/Images/SdgGoalsImages/goal-1.png';
import goal2 from '../../Assets/Images/SdgGoalsImages/goal-2.png';
import goal3 from '../../Assets/Images/SdgGoalsImages/goal-3.png';
import goal4 from '../../Assets/Images/SdgGoalsImages/goal-4.png';
import goal5 from '../../Assets/Images/SdgGoalsImages/goal-5.png';
import goal6 from '../../Assets/Images/SdgGoalsImages/goal-6.png';
import goal7 from '../../Assets/Images/SdgGoalsImages/goal-7.png';
import goal8 from '../../Assets/Images/SdgGoalsImages/goal-8.png';
import goal9 from '../../Assets/Images/SdgGoalsImages/goal-9.png';
import goal10 from '../../Assets/Images/SdgGoalsImages/goal-10.png';
import goal11 from '../../Assets/Images/SdgGoalsImages/goal-11.png';
import goal12 from '../../Assets/Images/SdgGoalsImages/goal-12.png';
import goal13 from '../../Assets/Images/SdgGoalsImages/goal-13.png';
import goal14 from '../../Assets/Images/SdgGoalsImages/goal-14.png';
import goal15 from '../../Assets/Images/SdgGoalsImages/goal-15.png';
import goal16 from '../../Assets/Images/SdgGoalsImages/goal-16.png';
import goal17 from '../../Assets/Images/SdgGoalsImages/goal-17.png';

import goal1Selected from '../../Assets/Images/SdgGoalsImages/goal-1-selected.png';
import goal2Selected from '../../Assets/Images/SdgGoalsImages/goal-2-selected.png';
import goal3Selected from '../../Assets/Images/SdgGoalsImages/goal-3-selected.png';
import goal4Selected from '../../Assets/Images/SdgGoalsImages/goal-4-selected.png';
import goal5Selected from '../../Assets/Images/SdgGoalsImages/goal-5-selected.png';
import goal6Selected from '../../Assets/Images/SdgGoalsImages/goal-6-selected.png';
import goal7Selected from '../../Assets/Images/SdgGoalsImages/goal-7-selected.png';
import goal8Selected from '../../Assets/Images/SdgGoalsImages/goal-8-selected.png';
import goal9Selected from '../../Assets/Images/SdgGoalsImages/goal-9-selected.png';
import goal10Selected from '../../Assets/Images/SdgGoalsImages/goal-10-selected.png';
import goal11Selected from '../../Assets/Images/SdgGoalsImages/goal-11-selected.png';
import goal12Selected from '../../Assets/Images/SdgGoalsImages/goal-12-selected.png';
import goal13Selected from '../../Assets/Images/SdgGoalsImages/goal-13-selected.png';
import goal14Selected from '../../Assets/Images/SdgGoalsImages/goal-14-selected.png';
import goal15Selected from '../../Assets/Images/SdgGoalsImages/goal-15-selected.png';
import goal16Selected from '../../Assets/Images/SdgGoalsImages/goal-16-selected.png';
import goal17Selected from '../../Assets/Images/SdgGoalsImages/goal-17-selected.png';
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

const SdgGoals = (props: any) => {
  const { onFormSubmit, sdgGoalsViewData, viewOnly } = props;
  const [formOne] = Form.useForm();
  const [sdgGoals, setSdgGoals] = useState<any[]>(sdgGoalsDetails);
  const [sdgGoalsFromProgramme, setSdgGoalsFromProgramme] = useState<any[]>([]);

  const getKeyByValue = (value: string) => {
    for (const key in SdgGoalsEnum) {
      if (SdgGoalsEnum[key as keyof typeof SdgGoalsEnum] === value) {
        return key;
      }
    }
    return undefined;
  };

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
    if (sdgGoalsViewData) {
      const sdgGoalsFromData = sdgGoalsViewData?.map((item: any) => getKeyByValue(item));
      const updatedSdgGoals = sdgGoals.map((goal) => {
        if (sdgGoalsFromData.includes(goal.name)) {
          return {
            ...goal,
            selected: true,
            image: returnSelectedImage(goal?.image),
          };
        } else {
          return goal;
        }
      });
      setSdgGoals(updatedSdgGoals);
    }
  }, []);

  useEffect(() => {
    const selectedGoals = sdgGoals
      .filter((goal: any) => goal.selected)
      .map((goal: any) => SdgGoalsEnum[goal.name as keyof typeof SdgGoalsEnum]);
    setSdgGoalsFromProgramme(selectedGoals);
  }, [sdgGoals]);

  useEffect(() => {
    onFormSubmit(sdgGoalsFromProgramme);
  }, [sdgGoalsFromProgramme]);

  return (
    <div className="co-benifits-tab-item">
      <Form name="sdg-goals-details" className="benifits-details-sdg-goals" form={formOne}>
        <Row gutter={[5, 16]} className="row">
          {sdgGoals?.map((sdgGoal: any) => (
            <Col sm={12} md={12} lg={4} xl={4} className="col">
              <div className={sdgGoalsViewData ? 'img-container-data' : 'img-container'}>
                <Form.Item name="images">
                  <img
                    src={sdgGoal?.image}
                    alt={`Image ${sdgGoal?.name}`}
                    onClick={() =>
                      !sdgGoalsViewData && handleImageSelect(sdgGoal?.name, sdgGoal?.image)
                    }
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
