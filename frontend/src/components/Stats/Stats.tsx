import React from 'react';
import './Stats.css';
import { IoAnalyticsOutline } from "react-icons/io5";
import { GiWingedSword } from "react-icons/gi";
import { BsStars } from "react-icons/bs";

const Stats: React.FC = () => {
    return  (

        <div className='Stats-wrapper'>
            <h2 className='title-s'>Statistics</h2>
            <div className='main'>
                <div className='statt'>
                    <p className='title'>Level</p>
                    <div className='middle'>1</div>
                    <div className='rank'>Rank: <span>gold</span></div>
                   <GiWingedSword className="icon"/>
                </div>
                <div className='statt'>
                    <p className='title'>Win streak</p>
                    <div className='middle'>16</div>
                   <BsStars className="icon"/>
                </div>
                <div className='statt'>
                    <p className='title'>Ratio</p>
                    <div className='middle'>8.0</div>
                    <div className='score'>
                        <p className='win'>Win: <span>32</span></p>
                        <p className='lose'>Lose: <span>4</span></p>
                    </div>
                   <IoAnalyticsOutline className="icon"/>
                </div>
            </div>
        </div>
    );
}

export default Stats;