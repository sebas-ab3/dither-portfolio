'use client';
import { Navbar } from '@/components/nav/Navbar';
import { BarrelDistortionFilter } from '@/components/crt/BarrelDistortionFilter';
import { SectionWrapper } from '@/components/sections/SectionWrapper';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function HomePage() {
  return (
    <>
      <BarrelDistortionFilter id="crt-barrel" />
      <Navbar />
      <main className="relative" style={{ filter: 'url(#crt-barrel)' }}>
        <SectionWrapper id="hero">
          <HeroSection />
        </SectionWrapper>
        <SectionWrapper id="skills">
          <SkillsSection />
        </SectionWrapper>
        <SectionWrapper id="projects">
          <ProjectsSection />
        </SectionWrapper>
        <SectionWrapper id="education">
          <EducationSection />
        </SectionWrapper>
        <SectionWrapper id="contact" enableBlur={false}>
          <ContactSection />
        </SectionWrapper>
      </main>
    </>
  );
}
