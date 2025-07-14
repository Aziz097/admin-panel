import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

/**
* @swagger
 * /api/pegawai:
* get:
 * summary: Fetches employees
 * description: >
 * Retrieves a list of all employees, or a single employee if an 'id' query parameter is provided.
 * parameters:
 * - in: query
 * name: id
 * schema:
 * type: integer
 * required: false
 * description: The ID of the employee to retrieve.
* responses:
* 200:
 * description: A list of employees or a single employee object.
* content:
* application/json:
* schema:
* type: array
* items:
 * type: object
 * properties:
 * id:
 * type: integer
 * nama:
 * type: string
 * nip:
 * type: string
 * jabatan:
* type: string
 * 400:
 * description: Invalid ID format.
 * 404:
 * description: Employee not found.
* 500:
* description: Internal server error.
*/
export async function GET(req: NextRequest) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

try {
    // Scenario 1: Fetch a single employee by ID
    if (id) {
      // Convert the ID from string to number for Prisma query
      const numericId = Number(id);
      if (isNaN(numericId)) {
        return NextResponse.json({ error: "Invalid ID format. ID must be a number." }, { status: 400 });
      }

      const pegawai = await prisma.pegawai.findUnique({
        where: { id: numericId },
      });

      // If no employee is found with the given ID, return a 404 error
      if (!pegawai) {
        return NextResponse.json({ error: "Pegawai not found" }, { status: 404 });
      }
    
      // Return the found employee
      return NextResponse.json(pegawai);
    }

    // Scenario 2: Fetch all employees if no ID is provided
    const allPegawai = await prisma.pegawai.findMany();
    return NextResponse.json(allPegawai);

} catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching pegawai data:", error);
    // Return a generic 500 internal server error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
}}
