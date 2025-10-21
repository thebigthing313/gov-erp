import { supabase } from "@/db/client";

export async function decryptSSN(
  employee_id: string,
) {
  // Call the database RPC function
  const { data, error } = await supabase.rpc("decrypt_ssn", {
    p_employee_id: employee_id,
  });

  // Handle any errors from the RPC call
  if (error) {
    throw new Error(`RPC function failed: ${error.message}`);
  }

  // If there's no data returned, throw an error
  if (!data) {
    throw new Error("No decrypted SSN data returned from the function.");
  }

  // Return the decrypted SSN
  return data;
}
