import React from 'react';
import { UtensilsCrossed, SlidersHorizontal, ChefHat } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    Icon: UtensilsCrossed,
    title: 'Add your ingredients',
    desc: 'Type in whatever ingredients you have at home. Add as many as you like, even a partial pantry works.',
  },
  {
    num: '02',
    Icon: SlidersHorizontal,
    title: 'Set your preferences',
    desc: 'Choose your cuisine type, browse traditional Nigerian dishes or let AI suggest international recipes.',
  },
  {
    num: '03',
    Icon: ChefHat,
    title: 'Get your recipe',
    desc: 'Instantly see ranked recipes based on what you already have, from fully makeable to almost there.',
  },
];

function HowItWorks({ darkMode }) {
  const t = {
    bg: darkMode ? '#1C1208' : '#FFF8F0',
    heading: darkMode ? '#FFFFFF' : '#1C1208',
    subtext: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(28,18,8,0.55)',
    cardBg: darkMode ? '#2A1F0E' : 'rgba(255,245,230,0.9)',
    cardBorder: darkMode ? '#3D2E14' : '#E8D5B0',
    stepNum: darkMode ? 'rgba(244,166,35,0.15)' : 'rgba(244,166,35,0.25)',
    cardTitle: darkMode ? '#FFFFFF' : '#1C1208',
    cardDesc: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(28,18,8,0.55)',
  };

  return (
    <section style={{ background: t.bg, padding: '96px 48px', transition: 'background 0.3s' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          color: t.heading,
          fontSize: 40,
          transition: 'color 0.3s',
        }}>
          How it works
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          color: t.subtext,
          fontSize: 17,
          marginTop: 12,
          transition: 'color 0.3s',
        }}>
          Three steps from your kitchen to your plate
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 24,
        maxWidth: 1000,
        margin: '56px auto 0',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {STEPS.map(({ num, Icon, title, desc }) => (
          <div key={num} style={{
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 20,
            padding: '40px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: '1 1 280px',
            maxWidth: 300,
            transition: 'background 0.3s, border-color 0.3s',
          }}>
            <div style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              color: t.stepNum,
              fontSize: 52,
              lineHeight: 1,
              marginBottom: 8,
              transition: 'color 0.3s',
            }}>
              {num}
            </div>

            <div style={{
              background: 'rgba(244,166,35,0.15)',
              border: '1px solid rgba(244,166,35,0.25)',
              borderRadius: 16,
              padding: 16,
              display: 'inline-flex',
              margin: '16px auto',
            }}>
              <Icon size={32} color="#F4A623" strokeWidth={1.5} />
            </div>

            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: t.cardTitle,
              fontSize: 18,
              marginTop: 12,
              transition: 'color 0.3s',
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: t.cardDesc,
              fontSize: 14,
              lineHeight: 1.7,
              marginTop: 8,
              maxWidth: 220,
              transition: 'color 0.3s',
            }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
