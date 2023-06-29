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
    name: SdgGoalsEnum.noPoverty,
    image: goal1,
    selected: false,
    activeImage: goal1Selected,
  },
  {
    name: SdgGoalsEnum.zeroHunger,
    image: goal2,
    selected: false,
    activeImage: goal2Selected,
  },
  {
    name: SdgGoalsEnum.gdHealth,
    image: goal3,
    selected: false,
    activeImage: goal3Selected,
  },
  {
    name: SdgGoalsEnum.qualityEducation,
    image: goal4,
    selected: false,
    activeImage: goal4Selected,
  },
  {
    name: SdgGoalsEnum.genderEq,
    image: goal5,
    selected: false,
    activeImage: goal5Selected,
  },
  {
    name: SdgGoalsEnum.cleanWatr,
    image: goal6,
    selected: false,
    activeImage: goal6Selected,
  },
  {
    name: SdgGoalsEnum.affEnergy,
    image: goal7,
    selected: false,
    activeImage: goal7Selected,
  },
  {
    name: SdgGoalsEnum.decentWork,
    image: goal8,
    selected: false,
    activeImage: goal8Selected,
  },
  {
    name: SdgGoalsEnum.industry,
    image: goal9,
    selected: false,
    activeImage: goal9Selected,
  },
  {
    name: SdgGoalsEnum.reducedInEq,
    image: goal10,
    selected: false,
    activeImage: goal10Selected,
  },
  {
    name: SdgGoalsEnum.sustainableCities,
    image: goal11,
    selected: false,
    activeImage: goal11Selected,
  },
  {
    name: SdgGoalsEnum.responsibleConsumption,
    image: goal12,
    selected: false,
    activeImage: goal12Selected,
  },
  {
    name: SdgGoalsEnum.climateAction,
    image: goal13,
    selected: false,
    activeImage: goal13Selected,
  },
  {
    name: SdgGoalsEnum.lifeBelowWater,
    image: goal14,
    selected: false,
    activeImage: goal14Selected,
  },
  {
    name: SdgGoalsEnum.lifeOnLand,
    image: goal15,
    selected: false,
    activeImage: goal15Selected,
  },
  {
    name: SdgGoalsEnum.peace,
    image: goal16,
    selected: false,
    activeImage: goal16Selected,
  },
  {
    name: SdgGoalsEnum.partnership,
    image: goal17,
    selected: false,
    activeImage: goal17Selected,
  },
];

const sdgGoalMap: any = {};
for (const g of sdgGoalsDetails) {
  sdgGoalMap[g.name] = g;
}

const SdgGoals = (props: any) => {
  const { onFormSubmit, sdgGoalsViewData, viewOnly } = props;
  const [formOne] = Form.useForm();
  const [sdgGoals, setSdgGoals] = useState<any[]>(sdgGoalsDetails);

  const handleImageSelect = (imageId: any) => {
    const g = sdgGoalMap[imageId];
    if (!g) {
      return;
    }
    g.selected = !g.selected;

    const u = [...sdgGoalsDetails];
    setSdgGoals(u);
  };

  useEffect(() => {
    if (sdgGoalsViewData) {
      for (const g of sdgGoalsViewData) {
        const sdg = sdgGoalMap[g as SdgGoalsEnum];
        if (sdg) {
          sdg.selected = true;
        } else {
          console.log('AAA', g);
        }
      }
    } else {
      for (const g of sdgGoalsDetails) {
        g.selected = false;
      }
    }
    const u = [...sdgGoalsDetails];
    setSdgGoals(u);
  }, []);

  useEffect(() => {
    const saveData: any[] = [];
    for (const g of sdgGoals) {
      if (g.selected) {
        saveData.push(g.name.toString());
      }
    }
    onFormSubmit(saveData);
  }, [sdgGoals]);

  return (
    <div className="co-benifits-tab-item">
      <Form name="sdg-goals-details" className="benifits-details-sdg-goals" form={formOne}>
        <Row gutter={[5, 16]} className="row">
          {sdgGoals?.map((sdgGoal: any) => (
            <Col sm={12} md={12} lg={4} xl={4} className="col">
              <div className={sdgGoalsViewData ? 'img-container-data' : 'img-container'}>
                <Form.Item name="images">
                  {!sdgGoal.selected && (
                    <img
                      src={sdgGoal?.image}
                      alt={`Image ${sdgGoal?.name}`}
                      onClick={() => !viewOnly && handleImageSelect(sdgGoal?.name)}
                    />
                  )}
                  {sdgGoal.selected && (
                    <img
                      src={sdgGoal?.activeImage}
                      alt={`Image ${sdgGoal?.name}`}
                      onClick={() => !viewOnly && handleImageSelect(sdgGoal?.name)}
                    />
                  )}
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
