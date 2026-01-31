-- CreateEnum (required for TripMember.role / TripMember.status)
CREATE TYPE "TripRole" AS ENUM ('OWNER', 'MEMBER');

CREATE TYPE "JoinStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable: use enums on existing TripMember table
ALTER TABLE "TripMember" ALTER COLUMN "role" TYPE "TripRole" USING "role"::"TripRole";

ALTER TABLE "TripMember" ALTER COLUMN "status" TYPE "JoinStatus" USING "status"::"JoinStatus";
