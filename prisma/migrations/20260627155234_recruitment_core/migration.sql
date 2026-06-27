-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "hiringManager" TEXT,
    "budget" DECIMAL(12,2),
    "openedAt" DATE NOT NULL,
    "closedAt" DATE,
    "projectContext" TEXT,
    "idealProfile" TEXT,
    "rejectedProfile" TEXT,
    "testCriteria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "source" TEXT,
    "salaryExpectation" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectionProcess" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "cultureFitScore" INTEGER,
    "fitJustification" TEXT,
    "rejectionReason" TEXT,
    "rejectionComment" TEXT,
    "feedbackSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectionProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageHistory" (
    "id" UUID NOT NULL,
    "processId" UUID NOT NULL,
    "stageName" TEXT NOT NULL,
    "stageStatus" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "pausedSeconds" INTEGER NOT NULL DEFAULT 0,
    "transcriptUrl" TEXT,
    "aiInsight" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "processId" UUID NOT NULL,
    "stageHistoryId" UUID NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "interviewers" JSONB NOT NULL,
    "inviteStatus" TEXT NOT NULL,
    "googleEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_key" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "SelectionProcess_jobId_idx" ON "SelectionProcess"("jobId");

-- CreateIndex
CREATE INDEX "SelectionProcess_candidateId_idx" ON "SelectionProcess"("candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "SelectionProcess_jobId_candidateId_key" ON "SelectionProcess"("jobId", "candidateId");

-- CreateIndex
CREATE INDEX "StageHistory_processId_idx" ON "StageHistory"("processId");

-- CreateIndex
CREATE INDEX "Appointment_processId_idx" ON "Appointment"("processId");

-- CreateIndex
CREATE INDEX "Appointment_stageHistoryId_idx" ON "Appointment"("stageHistoryId");

-- AddForeignKey
ALTER TABLE "SelectionProcess" ADD CONSTRAINT "SelectionProcess_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelectionProcess" ADD CONSTRAINT "SelectionProcess_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_processId_fkey" FOREIGN KEY ("processId") REFERENCES "SelectionProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_processId_fkey" FOREIGN KEY ("processId") REFERENCES "SelectionProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_stageHistoryId_fkey" FOREIGN KEY ("stageHistoryId") REFERENCES "StageHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
