import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import styles from './index.css.tsx';

gsap.registerPlugin(SplitText);

const formStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    pointerEvents: 'none',
  },
  form: {
    pointerEvents: 'auto',
    width: 'min(420px, 80vw)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    opacity: 0,
    transform: 'translateY(24px)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 600,
  },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '0.65rem 0.9rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    padding: '0.65rem 0.9rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'none',
    height: '110px',
    fontFamily: 'inherit',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
  },
  button: {
    flex: 1,
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '0.75rem',
    color: '#fff',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontWeight: 600,
  },
  cancelButton: {
    flex: 1,
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    fontWeight: 600,
  },
};

const ContactPage = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const clickZoneRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const isOpen = useRef(false);

  const showTitle = () => {
    const chars = splitRef.current?.chars;
    if (!chars) return;
    gsap.to(chars, {
      opacity: 1, scale: 1, filter: 'blur(0px)',
      stagger: { each: 0.06, from: 'center' },
      duration: 0.7, ease: 'power2.out',
    });
    if (titleRef.current) titleRef.current.style.pointerEvents = 'auto';
  };

  const hideTitle = () => {
    const chars = splitRef.current?.chars;
    if (!chars) return;
    gsap.to(chars, {
      opacity: 0, scale: 0.6, filter: 'blur(10px)',
      stagger: { each: 0.06, from: 'center' },
      duration: 0.5, ease: 'power2.in',
    });
    if (titleRef.current) titleRef.current.style.pointerEvents = 'none';
  };

  const openForm = () => {
    if (isOpen.current) return;
    isOpen.current = true;
    if (clickZoneRef.current) clickZoneRef.current.style.pointerEvents = 'none';
    hideTitle();
    gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.6, delay: 0.35, ease: 'power2.out' });
  };

  const closeForm = () => {
    if (!isOpen.current) return;
    isOpen.current = false;
    if (clickZoneRef.current) clickZoneRef.current.style.pointerEvents = 'auto';
    gsap.to(formRef.current, { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in' });
    showTitle();
  };

  useEffect(() => {
    if (!titleRef.current) return;
    gsap.set(titleRef.current, { opacity: 0 });
    splitRef.current = SplitText.create(titleRef.current, { type: 'chars' });
    const chars = splitRef.current.chars;

    const anim = gsap.from(chars, {
      opacity: 0, scale: 0.6, filter: 'blur(10px)',
      stagger: { each: 0.08, from: 'center' },
      duration: 0.9, ease: 'power2.out', delay: 0.3,
      onStart: () => { gsap.set(titleRef.current, { opacity: 1 }); },
    });

    return () => {
      anim.kill();
      splitRef.current?.revert();
      isOpen.current = false;
    };
  }, []);

  return (
    <div style={styles.page}>
      <h2
        ref={titleRef}
        style={{ ...styles.title, pointerEvents: 'none' }}
      >
        Contact Me
      </h2>
      {/* Full-area click target over the title — avoids gap-between-chars issue with SplitText spans */}
      <div
        ref={clickZoneRef}
        onClick={openForm}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '25vh',
          cursor: 'pointer',
          zIndex: 4,
        }}
      />

      <div style={formStyles.overlay}>
        <form ref={formRef} style={formStyles.form} onSubmit={e => e.preventDefault()}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Email</label>
            <input type="email" placeholder="you@example.com" style={formStyles.input} />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Subject</label>
            <input type="text" placeholder="What's this about?" style={formStyles.input} />
          </div>
          <div style={formStyles.field}>
            <label style={formStyles.label}>Message</label>
            <textarea placeholder="Your message..." style={formStyles.textarea} />
          </div>
          <div style={formStyles.row}>
            <button type="button" style={formStyles.cancelButton} onClick={closeForm}>Cancel</button>
            <button type="submit" style={formStyles.button}>Send Message</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
