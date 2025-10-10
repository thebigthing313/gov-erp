import type { MCMECSupabaseClient } from "./supabase";

export async function decryptSSN(
  supabase: MCMECSupabaseClient,
  profile_id: string,
) {
  // Invoke the Edge Function with the provided body.
  const { data, error: invokeError } = await supabase.functions.invoke(
    "decrypt_ssn",
    {
      body: { profileId: profile_id },
    },
  );

  // Handle any network-level or invocation errors.
  if (invokeError) {
    throw new Error(`Function invocation failed: ${invokeError.message}`);
  }

  // Check the data object for application-level errors returned by the function itself.
  if (data?.error) {
    throw new Error(`Function returned an error: ${data.error}`);
  }

  // If there's no data or the decryptedSSN property is missing, throw an error.
  if (!data || !data.decryptedSSN) {
    throw new Error("No decrypted SSN data returned from the function.");
  }

  // Return the specific value you need.
  return data.decryptedSSN;
}
