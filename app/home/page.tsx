'use client';
import { Navbar } from '@/components/nav/Navbar';
import { SectionWrapper } from '@/components/sections/SectionWrapper';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { EducationSection } from '@/components/sections/EducationSection';
import { ContactSection } from '@/components/sections/ContactSection';

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
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
      <SectionWrapper id="contact" enableScramble={false} enableBlur={false}>
        <ContactSection />
      </SectionWrapper>
    </main>
  );
}
