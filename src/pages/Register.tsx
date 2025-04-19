import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RegisterForm from "@/components/auth/RegisterForm";
import { RegisterFormData } from "@/types/auth";

const Register = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (data: RegisterFormData) => {
    setIsRegistering(true);
    const { name, email, password, role } = data;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      alert(`Signup Error: ${signUpError.message}`);
      setIsRegistering(false);
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      alert("Unexpected error: No user ID returned");
      setIsRegistering(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: userId,
        name,
        role,
      },
    ]);

    if (profileError) {
      alert(`Profile Insert Error: ${profileError.message}`);
    } else {
      alert("Registration successful!");
    }

    setIsRegistering(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <RegisterForm onSubmit={handleRegister} isRegistering={isRegistering} />
    </div>
  );
};

export default Register;
