import { NextResponse } from "next/server";
import { residentProfile } from "@/lib/data/resident";
import { walletPostingResult } from "@/lib/data/wallet-statements";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ residentId: string }> },
) {
  const { residentId } = await params;
  if (residentId !== residentProfile.id)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RESIDENT_NOT_FOUND",
          message: "Resident wallet was not found",
        },
      },
      { status: 404 },
    );

  return NextResponse.json({
    success: true,
    data: {
      residentId,
      walletBalance: walletPostingResult.closingBalanceCents / 100,
      pendingCredits: residentProfile.pendingCredits,
      totalEarned: residentProfile.totalEarned,
      recentTransactions: walletPostingResult.allTransactions,
    },
  });
}
