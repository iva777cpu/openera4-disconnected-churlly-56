import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SaveProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: {
    userAge: string;
    userGender: string;
    targetAge: string;
    targetGender: string;
  };
}

export const SaveProfileDialog: React.FC<SaveProfileDialogProps> = ({
  open,
  onOpenChange,
  profileData,
}) => {
  const [profileName, setProfileName] = useState("");
  const { toast } = useToast();

  const handleSaveProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save profiles",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        profile_name: profileName,
        user_age: profileData.userAge,
        user_gender: profileData.userGender,
        target_age: profileData.targetAge,
        target_gender: profileData.targetGender,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile saved successfully",
      });
      onOpenChange(false);
      setProfileName("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2D4531] text-[#EDEDDD] border-[#1A2A1D]">
        <DialogHeader>
          <DialogTitle>Save Profile</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter profile name"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="bg-[#1A2A1D] text-[#EDEDDD] border-[#303D24]"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleSaveProfile}
            disabled={!profileName}
            className="bg-[#303D24] text-[#EDEDDD] hover:bg-[#1A2A1D]"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};