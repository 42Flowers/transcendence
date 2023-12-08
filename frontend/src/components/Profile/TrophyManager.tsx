import React from "react";
import './TrophyManager.scss';
import SocketContext from "../Socket/Context/Context";
import { Achievement } from "../../api";
import map from 'lodash/map';
import cx from 'classnames';
import { useAuthContext } from "../../contexts/AuthContext";
import { queryClient } from "../../query-client";

function useGatewayEvent<E = any>(ev: string, handleEvent: (evt: E) => void) {
    const { socket } = React.useContext(SocketContext);

    React.useEffect(() => {
        if (undefined !== socket) {
            socket.on(ev, handleEvent);

            return () => {
                socket.off(ev, handleEvent);  
            };
        }
    }, [ socket, handleEvent ]);
}


type TrophyProps = {
    title: string;
    score: number;
    animate?: boolean;
}

const Trophy: React.FC<TrophyProps> = ({ title, score, animate }) => (
    <div className="trophy">
        <div className="animation">
            <div className={cx('circle', { 'circle_animate': !!animate })}>
                <div className="img xbox_img">
                    <img src="https://dl.dropboxusercontent.com/s/uopiulb5yeo1twm/xbox.svg?dl=0" />
                </div>
                <div className={cx('brilliant-wrap', { 'animate': !!animate })}>
                    <div className="brilliant">
                    </div>
                </div>
            </div>
            <div className="banner-outer">
                <div className={cx('banner', { 'banner-animate': !!animate })}>
                    <div className={cx('achieve_disp', { 'achieve_disp_animate': !!animate })}>
                        <span className="unlocked">
                            Achievement unlocked
                        </span>
                        <div className="score_disp">
                            <div className="gamerscore">
                                <img width="20px" src="https://dl.dropboxusercontent.com/s/gdqf5amvjkx9rfb/G.svg?dl=0" />
                                <span className="acheive_score">{score}</span>
                            </div>
                            <span className="hyphen_sep">-</span>
                            <span className="achiev_name">{title}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const TrophyManager: React.FC = () => {
    const [ pendingAchievements, setPendingAchievements ] = React.useState<Achievement[]>([]);

    useGatewayEvent('achievement.granted', e => {
        setPendingAchievements(achievements => ([ ...achievements, e ]));
        queryClient.setQueryData<Achievement[]>([ '@me', 'achievements' ], achievements => [
            ...(achievements ?? []),
            e,
        ]);
    });

    /**
     * There is an inoffensive bug here : if we add another trophy when a trophy is already displayed,
     * it resets the timeout thus delaying the next one.
     */
    React.useEffect(() => {
        if (pendingAchievements.length > 0) {
            const timer = setTimeout(() => {
                setPendingAchievements(achievements => achievements.slice(1));
            }, 10500);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [ pendingAchievements ]);

    return (
        map(pendingAchievements, ({ name }, idx) => (
            <Trophy key={name} title={name} score={100} animate={idx === 0} />
        ))  
    );
}