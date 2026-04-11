import gsap from 'gsap';

interface HorizontalLoopConfig {
  paused?: boolean;
  repeat?: number;
  speed?: number;
  snap?: boolean | number;
  paddingRight?: number;
  reversed?: boolean;
  center?: boolean;
  draggable?: boolean;
  onChange?: (element: Element, index: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

interface HorizontalLoopReturn extends gsap.core.Timeline {
  next: (vars?: gsap.TweenVars) => void;
  previous: (vars?: gsap.TweenVars) => void;
  toIndex: (index: number, vars?: gsap.TweenVars) => void;
  current: () => number;
  times: number[];
}

export function horizontalLoop(
  items: Element[] | NodeListOf<Element>,
  config: HorizontalLoopConfig = {}
): HorizontalLoopReturn {
  const itemsArray = gsap.utils.toArray(items) as HTMLElement[];
  const tl = gsap.timeline({
    repeat: config.repeat ?? 0,
    paused: config.paused ?? true,
    defaults: { ease: 'none' },
    onReverseComplete: () => {
      tl.totalTime(tl.rawTime() + tl.duration() * 100);
    },
  }) as HorizontalLoopReturn;

  const length = itemsArray.length;
  const startX = itemsArray[0].offsetLeft;
  const times: number[] = [];
  const widths: number[] = [];
  const xPercents: number[] = [];
  let curIndex = 0;
  const pixelsPerSecond = (config.speed || 1) * 100;
  const snap =
    config.snap === false
      ? (v: number) => v
      : gsap.utils.snap(typeof config.snap === 'number' ? config.snap : 1);
  let curX: number;
  let distanceToStart: number;
  let distanceToLoop: number;
  let item: HTMLElement;
  let i: number;

  gsap.set(itemsArray, {
    xPercent: (i, el) => {
      const w = (widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string));
      xPercents[i] = snap(
        (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / w) * 100 +
          (gsap.getProperty(el, 'xPercent') as number)
      );
      return xPercents[i];
    },
  });

  gsap.set(itemsArray, { x: 0 });

  const totalWidth =
    itemsArray[length - 1].offsetLeft +
    (xPercents[length - 1] / 100) * widths[length - 1] -
    startX +
    itemsArray[length - 1].offsetWidth *
      (gsap.getProperty(itemsArray[length - 1], 'scaleX') as number) +
    (parseFloat(String(config.paddingRight)) || 0);

  for (i = 0; i < length; i++) {
    item = itemsArray[i];
    curX = (xPercents[i] / 100) * widths[i];
    distanceToStart = item.offsetLeft + curX - startX;
    distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);
    tl.to(
      item,
      {
        xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
        duration: distanceToLoop / pixelsPerSecond,
      },
      0
    )
      .fromTo(
        item,
        {
          xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100),
        },
        {
          xPercent: xPercents[i],
          duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
          immediateRender: false,
        },
        distanceToLoop / pixelsPerSecond
      )
      .add('label' + i, distanceToStart / pixelsPerSecond);
    times[i] = distanceToStart / pixelsPerSecond;
  }

  function toIndex(index: number, vars?: gsap.TweenVars) {
    vars = vars || {};
    if (Math.abs(index - curIndex) > length / 2) {
      index += index > curIndex ? -length : length;
    }
    const newIndex = gsap.utils.wrap(0, length, index);
    let time = times[newIndex];
    if (time > tl.time() !== index > curIndex) {
      vars.modifiers = { time: gsap.utils.wrap(0, tl.duration()) };
      time += tl.duration() * (index > curIndex ? 1 : -1);
    }
    curIndex = newIndex;
    vars.overwrite = true;
    return tl.tweenTo(time, vars);
  }

  tl.next = (vars?: gsap.TweenVars) => toIndex(curIndex + 1, vars);
  tl.previous = (vars?: gsap.TweenVars) => toIndex(curIndex - 1, vars);
  tl.current = () => curIndex;
  tl.toIndex = (index: number, vars?: gsap.TweenVars) => toIndex(index, vars);
  tl.times = times;

  tl.progress(1, true).progress(0, true);

  if (config.reversed) {
    tl.vars.onReverseComplete!();
    tl.reverse();
  }

  if (config.draggable && typeof Draggable !== 'undefined') {
    const proxy = document.createElement('div');
    const wrap = gsap.utils.wrap(0, 1);
    let ratio: number;
    let startProgress: number;
    const align = () => {
      tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
    };
    const syncIndex = () => {
      curIndex = Math.round(tl.progress() * (length - 1));
    };

    if (typeof InertiaPlugin === 'undefined') {
      console.warn('InertiaPlugin required for momentum-based scrolling and snapping.');
    }

    const draggable = Draggable.create(proxy, {
      trigger: itemsArray[0].parentNode as HTMLElement,
      type: 'x',
      onPress() {
        startProgress = tl.progress();
        tl.progress(0);
        ratio = 1 / totalWidth;
        gsap.set(proxy, { x: startProgress / -ratio });
        config.onDragStart?.();
      },
      onDrag: align,
      onThrowUpdate: align,
      inertia: true,
      snap: (value: number) => {
        if (config.snap === false) return value;
        const n = -(value * ratio);
        const snapProgress = snap(n);
        return -(snapProgress * totalWidth) * ratio;
      },
      onRelease() {
        syncIndex();
        config.onDragEnd?.();
      },
      onThrowComplete() {
        syncIndex();
        if (config.onChange) {
          config.onChange(itemsArray[curIndex], curIndex);
        }
      },
    })[0];

    tl.draggable = draggable;
  }

  if (config.center) {
    const centerOffset = ((window.innerWidth - widths[0]) / 2 / widths[0]) * 100;
    gsap.set(itemsArray, { xPercent: i => xPercents[i] + centerOffset });
  }

  tl.eventCallback('onUpdate', () => {
    const prog = tl.progress();
    const newIndex = Math.round(prog * (length - 1));
    if (newIndex !== curIndex && config.onChange) {
      curIndex = newIndex;
      config.onChange(itemsArray[curIndex], curIndex);
    }
  });

  return tl;
}
