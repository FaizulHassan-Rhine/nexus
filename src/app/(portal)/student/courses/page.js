"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, SectionHeader } from "@/components/ui";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui";
import { Button, Badge, Progress, EmptyState } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { useCurrentUser, useHydrated } from "@/hooks/useApp";
import { courseService } from "@/lib/mockServices";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { toast } from "sonner";
import { getStudentMatches } from "../_lib/helpers";

function CourseCard({ course, enrollment, onEnroll, onComplete, loading }) {
  const isEnrolled = Boolean(enrollment);
  const isComplete = enrollment?.status === "Completed";

  return (
    <article className="card-surface p-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="teal">{course.type}</Badge>
        <Badge tone="slate">{course.deliveryMode}</Badge>
      </div>
      <h3 className="mt-2 text-lg font-semibold">
        <Link href={`/courses/${course.slug}`} className="hover:text-nexus-700">
          {course.title}
        </Link>
      </h3>
      <p className="text-sm text-secondary">{course.providerName}</p>
      <p className="mt-2 line-clamp-2 text-sm text-secondary">{course.description}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {(course.skills || []).map((s) => (
          <Badge key={s} tone="violet">{s}</Badge>
        ))}
      </div>
      <p className="mt-3 text-xs text-secondary">
        {course.duration} · {course.price?.amount ? formatCurrency(course.price.amount) : "Free"} · Starts {formatDate(course.startDate)}
      </p>
      {isEnrolled ? (
        <div className="mt-4 space-y-2">
          <Progress value={enrollment.progress || 0} label={enrollment.status} />
          {!isComplete ? (
            <Button size="sm" loading={loading} onClick={() => onComplete(course.id)}>
              Mark complete
            </Button>
          ) : (
            <Badge tone="green">Completed</Badge>
          )}
        </div>
      ) : (
        <Button size="sm" className="mt-4" loading={loading} onClick={() => onEnroll(course.id)}>
          Enroll
        </Button>
      )}
    </article>
  );
}

export default function CoursesPage() {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const courses = useAppStore((s) => s.courses);
  const matches = useAppStore((s) => s.matches);
  const [loadingId, setLoadingId] = useState(null);

  const userMatches = useMemo(
    () => (user ? getStudentMatches(matches, user.id) : []),
    [matches, user]
  );

  const recommended = useMemo(() => {
    const suggestedIds = new Set();
    userMatches.forEach((m) => {
      (m.suggestedCourses || []).forEach((c) => {
        const found = courses.find((co) => co.title.includes(c) || co.id === c);
        if (found) suggestedIds.add(found.id);
      });
    });
    courses.filter((c) => c.linkedOpportunityIds?.some((oid) => userMatches.some((m) => m.opportunityId === oid))).forEach((c) => suggestedIds.add(c.id));
    return courses.filter((c) => suggestedIds.has(c.id)).slice(0, 12);
  }, [courses, userMatches]);

  const enrollments = user?.courseEnrollments || [];
  const enrolled = courses.filter((c) => enrollments.some((e) => e.courseId === c.id && e.status !== "Completed"));
  const completed = courses.filter((c) => enrollments.some((e) => e.courseId === c.id && e.status === "Completed"));

  const getEnrollment = (courseId) => enrollments.find((e) => e.courseId === courseId);

  const handleEnroll = async (courseId) => {
    if (getEnrollment(courseId)) {
      toast.message("Already enrolled");
      return;
    }
    setLoadingId(courseId);
    try {
      await courseService.enroll(courseId);
      toast.success("Enrolled successfully");
    } finally {
      setLoadingId(null);
    }
  };

  const handleComplete = async (courseId) => {
    setLoadingId(courseId);
    try {
      await courseService.complete(courseId);
      toast.success("Course completed — skills updated");
    } finally {
      setLoadingId(null);
    }
  };

  if (!hydrated) return null;

  const renderList = (list) =>
    list.length ? (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            enrollment={getEnrollment(course.id)}
            onEnroll={handleEnroll}
            onComplete={handleComplete}
            loading={loadingId === course.id}
          />
        ))}
      </div>
    ) : (
      <EmptyState title="No courses" description="Explore recommended courses to build skills for your matches." />
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description="Recommended, enrolled, and completed learning paths" />

      <Tabs defaultValue="recommended">
        <TabList>
          <Tab value="recommended">Recommended ({recommended.length})</Tab>
          <Tab value="enrolled">Enrolled ({enrolled.length})</Tab>
          <Tab value="completed">Completed ({completed.length})</Tab>
        </TabList>
        <TabPanel value="recommended">{renderList(recommended.length ? recommended : courses.slice(0, 6))}</TabPanel>
        <TabPanel value="enrolled">{renderList(enrolled)}</TabPanel>
        <TabPanel value="completed">{renderList(completed)}</TabPanel>
      </Tabs>
    </div>
  );
}
