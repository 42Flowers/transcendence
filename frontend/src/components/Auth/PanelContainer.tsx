import React, { PropsWithChildren, useContext } from 'react';
import { Stack } from '@mui/material';
export interface PanelProps {
	index: number;
};

export interface IAnimationContext {
	currentIndex: number;
	// setCurrentIndex: (value: number | ((prevIndex: number) => number)) => void;
    containerHeight: number;
    updateContainerHeight: (height: number) => void;
};

const AnimationContext = React.createContext<IAnimationContext>(undefined as any);

export const useAnimationContext = () => useContext(AnimationContext);

interface PanelContainerProps {
	// initialIndex?: number;
	currentIndex: number;
}

export const Panel: React.FC<PropsWithChildren<PanelProps>> = ({ children, index }) => {
	const { currentIndex, updateContainerHeight, containerHeight } = useContext(AnimationContext);
	const [ mounted, setMounted ] = React.useState(false);
    const ref = React.createRef<HTMLDivElement>();

	let animationClass;

	if (index === currentIndex) {
		animationClass = '';
	} else if (index > currentIndex) {
		animationClass = 'pushed-right';
	} else if (index < currentIndex) {
		animationClass = 'pushed-left';
	}

	React.useEffect(() => {
		if (currentIndex === index && !mounted) {
			setMounted(true);
		}
	}, [ currentIndex ]);

    React.useEffect(() => {
        if (mounted && ref.current) {
            const height = ref.current.getBoundingClientRect().height;

            if (height !== containerHeight) {
                updateContainerHeight(height);
            }
        }
    }, [ mounted ]);

	return (
		<div className={`auth-panel ${animationClass}`} ref={ref} onTransitionEnd={() => setMounted(currentIndex === index)}>
			{mounted && children}
		</div>
	);
};

export const PanelContainer: React.FC<PropsWithChildren<PanelContainerProps>> = ({ children, currentIndex = 0 }) => {
    const [ currentHeight, setCurrentHeight ] = React.useState<number>(0);
	const ctx: IAnimationContext = {
		currentIndex,
        updateContainerHeight: setCurrentHeight,
        containerHeight: currentHeight,
	};

	return (
		<Stack alignItems="center">
            <div className="auth-container" style={{ height: `${currentHeight}px` }}>
                <AnimationContext.Provider value={ctx}>
                    {children}
                </AnimationContext.Provider>
            </div>
		</Stack>
	);
};

