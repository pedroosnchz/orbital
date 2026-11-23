-- CreateTable
CREATE TABLE "Passenger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "seat" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_email_key" ON "Passenger"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Passenger_seat_key" ON "Passenger"("seat");
