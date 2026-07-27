import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

type ExpandableProps = {
  className?: string;
  expanded: boolean;
  children: ReactNode;
};

/**
 * The duration of the expand and collapse animation in milliseconds.
 */
const DURATION = 150;

/**
 * Wrapper component to vertically expand or collapse content. The content is
 * measured via `onLayout` and the wrapper's height is animated to it, so
 * surrounding elements move smoothly instead of jumping.
 */
export function Expandable({ expanded, children, className }: ExpandableProps) {
  // Use frozen children state
  const [frozenChildren, setFrozenChildren] = useState<ReactNode>(children);

  // Freeze error while element collapses to prevent UI from jumping
  useEffect(() => {
    if (expanded) {
      // Hint: The last visible children must be kept in sync while expanded,
      // so the content does not blank out instantly when it collapses
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFrozenChildren(children);
    } else {
      const timeout = setTimeout(() => setFrozenChildren(children), DURATION);
      return () => clearTimeout(timeout);
    }
  }, [expanded, children]);

  // Use content height state measured via layout events
  const [contentHeight, setContentHeight] = useState(0);

  // Animate the expansion progress when expanded changes
  const progress = useDerivedValue(
    () => withTiming(expanded ? 1 : 0, { duration: DURATION }),
    [expanded]
  );

  // Animate height, opacity and offset based on the expansion progress
  const animatedStyle = useAnimatedStyle(
    () => ({
      height: contentHeight * progress.value,
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * -8 }],
    }),
    [contentHeight]
  );

  return (
    <Animated.View
      style={[{ overflow: 'hidden' }, animatedStyle]}
      aria-hidden={!expanded}
    >
      <View
        className={clsx('absolute left-0 right-0 top-0', className)}
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
      >
        {frozenChildren}
      </View>
    </Animated.View>
  );
}
