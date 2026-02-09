import React from "react";
import "./Techstack.css";
import { TechstackList } from "../../utils/techstackList";
import RubberBand from "react-reveal/RubberBand";
import Fade from "react-reveal/Fade";
const Techstack = () => {
  const categories = [...new Set(TechstackList.map((t) => t.category))];
  return (
    <>
      <div className="container techstack" id="techstack">
        <RubberBand>
          <h2 className="col-12 mt-3 mb-1 text-center text-uppercase">
            Tech Stack
          </h2>
          <hr />
          <p className="pb-3 text-center">
            Including programming languages, frameworks, databases, mobile
            tools, ML & deployment
          </p>
        </RubberBand>

        {categories.map((cat) => (
          <div key={cat} className="category-section mb-4">
            <h4 className="category-title">{cat}</h4>
            <div className="row">
            {TechstackList.filter(t => t.category === cat).map(tech => (
                <Fade left key={tech._id}>
                  <div className="col-md-3">
                    <div className="card m-2">
                      <div className="card-content">
                        <div className="card-body">
                          <div className="media d-flex justify-content-center">
                            <div className="align-self-center">
                              <tech.icon className="tech-icon" />
                            </div>
                            <div className="media-body">
                              <h5>{tech.name}</h5>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default Techstack;