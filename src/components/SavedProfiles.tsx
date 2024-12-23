import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Edit2, Trash2, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "./ui/input";

interface SavedProfilesProps {
  onSelectProfile: (profile: any) => void;
  onBack: () => void;
}

export const SavedProfiles: React.FC<SavedProfilesProps> = ({ onSelectProfile, onBack }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const { data: profiles, refetch } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({ profile_name: name })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Success",
        description: "Profile name updated successfully",
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile name",
        variant: "destructive",
      });
    },
  });

  const handleDeleteProfile = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile deleted successfully",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    }
  };

  const startEditing = (profile: any) => {
    setEditingId(profile.id);
    setEditingName(profile.profile_name);
  };

  const handleSaveProfileName = async () => {
    if (editingId && editingName.trim()) {
      await updateProfileMutation.mutateAsync({
        id: editingId,
        name: editingName.trim(),
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-[#EDEDDD] hover:bg-[#2D4531] mr-4"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold text-[#EDEDDD]">Profiles</h1>
      </div>

      {profiles?.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between p-3 bg-[#2D4531] rounded-lg"
        >
          {editingId === profile.id ? (
            <div className="flex items-center gap-2 flex-grow">
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="bg-[#303D24] text-[#EDEDDD] border-[#1A2A1D]"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveProfileName}
                className="text-[#EDEDDD] hover:bg-[#1A2A1D]"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span
              className="text-[#EDEDDD] cursor-pointer flex-grow"
              onClick={() => onSelectProfile(profile)}
            >
              {profile.profile_name}
            </span>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditing(profile)}
              className="text-[#EDEDDD] hover:bg-[#1A2A1D]"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteProfile(profile.id)}
              className="text-[#EDEDDD] hover:bg-[#1A2A1D]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};