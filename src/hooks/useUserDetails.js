import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

const useUserDetails = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('Session:', session); // DEBUG

        if (sessionError) {
          throw sessionError;
        }

        if (session && session.user) {
          const userEmail = session.user.email;
          console.log('User email:', userEmail); // DEBUG

          const { data: userData, error: userError } = await supabase
            .from("lecturers")
            .select("*")
            .eq("email", userEmail)
            .single();

          console.log('Lecturer data:', userData); // DEBUG
          console.log('Lecturer error:', userError); // DEBUG

          if (userError) {
            if (userError.code === "PGRST116") {
              setError("User details not found.");
              toast.error("Lecturer profile not found. Please register again.");
            } else {
              throw userError;
            }
          } else if (userData) {
            console.log('Setting user details:', userData); // DEBUG
            setUserDetails(userData);
          }
        } else {
          setError("User is not logged in.");
          toast.error("Please log in to continue.");
        }
      } catch (error) {
        console.error('useUserDetails error:', error); // DEBUG
        toast.error(
          `${
            error.message === "TypeError: Failed to fetch"
              ? "Please, check your Internet connection"
              : error.message
          }`
        );
        setError(
          error.message === "TypeError: Failed to fetch"
            ? "Please, check your Internet connection"
            : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return { userDetails, userDetailsError: error, loading };
};

export default useUserDetails;