import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  GraduationCap,
  Users,
  Calendar,
  User,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  primary: "bg-[rgba(0,201,167,0.15)] text-[#00C9A7] border-[#00C9A7]/30",
  secondary: "bg-[rgba(99,102,241,0.15)] text-[#6366F1] border-[#6366F1]/30",
  tertiary: "bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[#F59E0B]/30",
  vocational: "bg-[rgba(59,130,246,0.15)] text-[#3B82F6] border-[#3B82F6]/30",
  special_needs: "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[#EF4444]/30",
};

export default function SchoolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const schoolId = Number(id);

  const { data: school, isLoading } = trpc.school.getById.useQuery(
    { id: schoolId },
    { enabled: !isNaN(schoolId) }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5A6478]">Loading...</div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-[#3A4560]" />
        <h2 className="text-[20px] font-semibold text-[#E8ECF1] mb-2">
          School not found
        </h2>
        <p className="text-[13px] text-[#5A6478] mb-4">
          The school you're looking for doesn't exist.
        </p>
        <Button
          onClick={() => navigate("/schools")}
          className="bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A]"
        >
          Back to Schools
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[900px]">
      {/* Back button */}
      <button
        onClick={() => navigate("/schools")}
        className="flex items-center gap-2 text-[13px] text-[#8B95A8] hover:text-[#00C9A7] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Schools
      </button>

      {/* Header */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#E8ECF1] mb-2">
              {school.name}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[12px] font-medium capitalize ${
                  CATEGORY_COLORS[school.category] ?? ""
                }`}
              >
                {school.category.replace(/_/g, " ")}
              </Badge>
              <Badge
                variant="outline"
                className="text-[12px] font-medium capitalize text-[#8B95A8] border-[#3A4560]"
              >
                {school.type.replace(/_/g, " ")}
              </Badge>
              {school.verified === 1 && (
                <Badge className="bg-[rgba(34,197,94,0.15)] text-[#22C55E] border-[#22C55E]/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-[14px] text-[#8B95A8]">
          <MapPin className="w-4 h-4 text-[#5A6478]" />
          <span>
            {school.address
              ? `${school.address}, `
              : ""}
            {school.city ? `${school.city}, ` : ""}
            {school.lga ? `${school.lga}, ` : ""}
            {school.state}, {school.country}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {school.phone && (
          <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#22C55E]" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
                Phone
              </span>
            </div>
            <a
              href={`tel:${school.phone}`}
              className="text-[14px] text-[#E8ECF1] hover:text-[#00C9A7] transition-colors"
            >
              {school.phone}
            </a>
          </div>
        )}

        {school.email && (
          <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
                <Mail className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
                Email
              </span>
            </div>
            <a
              href={`mailto:${school.email}`}
              className="text-[14px] text-[#E8ECF1] hover:text-[#00C9A7] transition-colors break-all"
            >
              {school.email}
            </a>
          </div>
        )}

        {school.website && (
          <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.1)] flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#6366F1]" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
                Website
              </span>
            </div>
            <a
              href={school.website.startsWith("http") ? school.website : `https://${school.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#E8ECF1] hover:text-[#00C9A7] transition-colors flex items-center gap-1"
            >
              Visit
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
          Additional Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {school.principalName && (
            <div className="flex items-center gap-3 p-3 bg-[#0B0E13] rounded-lg">
              <User className="w-4 h-4 text-[#5A6478]" />
              <div>
                <div className="text-[11px] text-[#5A6478]">Principal</div>
                <div className="text-[13px] text-[#E8ECF1]">
                  {school.principalName}
                </div>
              </div>
            </div>
          )}

          {school.studentCount && (
            <div className="flex items-center gap-3 p-3 bg-[#0B0E13] rounded-lg">
              <GraduationCap className="w-4 h-4 text-[#5A6478]" />
              <div>
                <div className="text-[11px] text-[#5A6478]">Students</div>
                <div className="text-[13px] text-[#E8ECF1]">
                  {school.studentCount.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {school.staffCount && (
            <div className="flex items-center gap-3 p-3 bg-[#0B0E13] rounded-lg">
              <Users className="w-4 h-4 text-[#5A6478]" />
              <div>
                <div className="text-[11px] text-[#5A6478]">Staff</div>
                <div className="text-[13px] text-[#E8ECF1]">
                  {school.staffCount.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {school.yearEstablished && (
            <div className="flex items-center gap-3 p-3 bg-[#0B0E13] rounded-lg">
              <Calendar className="w-4 h-4 text-[#5A6478]" />
              <div>
                <div className="text-[11px] text-[#5A6478]">Established</div>
                <div className="text-[13px] text-[#E8ECF1]">
                  {school.yearEstablished}
                </div>
              </div>
            </div>
          )}
        </div>

        {school.notes && (
          <div className="mt-4 p-3 bg-[#0B0E13] rounded-lg">
            <div className="text-[11px] text-[#5A6478] mb-1">Notes</div>
            <div className="text-[13px] text-[#E8ECF1]">{school.notes}</div>
          </div>
        )}

        {school.source && (
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[#5A6478]">
            <span>Source:</span>
            <a
              href={school.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00C9A7] hover:underline truncate max-w-md"
            >
              {school.source}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
