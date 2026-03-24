import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jdService } from "../../services/jd.service";
import type { EmploymentType, ExperienceLevel } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import { cn } from "../../utils/cn";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 10;

export function JDCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDepartmentId, setUploadDepartmentId] = useState("");
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [uploadExperienceLevel, setUploadExperienceLevel] = useState<
    ExperienceLevel | ""
  >("");
  const [uploadEmploymentTypes, setUploadEmploymentTypes] = useState<
    EmploymentType[]
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: jdService.getDepartments,
  });
  const { data: employmentTypes = [] } = useQuery({
    queryKey: ["employment-types"],
    queryFn: jdService.getEmploymentTypes,
  });
  const { data: experienceLevels = [] } = useQuery({
    queryKey: ["experience-levels"],
    queryFn: jdService.getExperienceLevels,
  });

  const onSuccess = (jd: { id: string }) => {
    queryClient.invalidateQueries({ queryKey: ["jds"] });
    navigate(`/jd/${jd.id}`);
  };

  const uploadMutation = useMutation({
    mutationFn: ({
      file,
      title,
      departmentId,
      experienceLevel,
      employmentTypes,
    }: {
      file: File;
      title?: string;
      departmentId?: string;
      experienceLevel?: ExperienceLevel;
      employmentTypes?: EmploymentType[];
    }) =>
      jdService.uploadFromFile(file, {
        title,
        departmentId,
        experienceLevel,
        employmentTypes,
      }),
    onSuccess,
  });

  const createDepartmentMutation = useMutation({
    mutationFn: (name: string) => jdService.createDepartment({ name }),
    onSuccess: async (department) => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      setUploadDepartmentId(department.id);
      setShowCreateDepartment(false);
      setNewDepartmentName("");
      toast.success("Department created successfully.");
    },
    onError: () => {
      toast.error("Failed to create department. Please try again.");
    },
  });

  const isPending = uploadMutation.isPending;
  const mutationError = uploadMutation.error;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type))
      return "Only PDF and DOCX files are accepted.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File size must be under ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const handleFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError(null);
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const toggleEmploymentType = (et: EmploymentType) => {
    setUploadEmploymentTypes((prev) =>
      prev.includes(et) ? prev.filter((x) => x !== et) : [...prev, et],
    );
  };

  const handleDepartmentChange = (value: string) => {
    if (value === "__create_new__") {
      setUploadDepartmentId("");
      setShowCreateDepartment(true);
      return;
    }
    setUploadDepartmentId(value);
    setShowCreateDepartment(false);
  };

  const handleCreateDepartment = () => {
    const name = newDepartmentName.trim();
    if (!name) return;
    createDepartmentMutation.mutate(name);
  };

  const handleCloseCreateDepartmentModal = () => {
    setShowCreateDepartment(false);
    setNewDepartmentName("");
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({
        file: selectedFile,
        title: uploadTitle.trim() || undefined,
        departmentId: uploadDepartmentId || undefined,
        experienceLevel:
          (uploadExperienceLevel as ExperienceLevel) || undefined,
        employmentTypes: uploadEmploymentTypes.length
          ? uploadEmploymentTypes
          : undefined,
      });
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/jd")}
          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Job Description</h1>
      </div>

      <Card>
        {mutationError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-lg flex gap-2.5">
            <svg
              className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-500">
              Failed to create job description. Please try again.
            </p>
          </div>
        )}

        <div className="space-y-5">
          <Input
            label="Job Title (optional)"
            placeholder="Auto-extracted from file if left empty"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Department (optional)
              </label>
              <select
                value={uploadDepartmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              >
                <option value="">— None —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                <option value="__create_new__">+ Create new department</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Experience Level (optional)
              </label>
              <select
                value={uploadExperienceLevel}
                onChange={(e) =>
                  setUploadExperienceLevel(
                    e.target.value as ExperienceLevel | "",
                  )
                }
                className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              >
                <option value="">— None —</option>
                {experienceLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {employmentTypes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Employment Types (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {employmentTypes.map((et) => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => toggleEmploymentType(et)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                      uploadEmploymentTypes.includes(et)
                        ? "bg-red-500 border-red-500 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-red-300",
                    )}
                  >
                    {et.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
              dragActive
                ? "border-red-400 bg-red-50"
                : selectedFile
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 hover:border-red-300 hover:bg-red-50/50",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleInputChange}
            />
            {selectedFile ? (
              <div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="h-6 w-6 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-red-500 mt-2 font-medium">
                  Click to change file
                </p>
              </div>
            ) : (
              <div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="font-medium text-gray-900 text-sm">
                  Drop your JD file here
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or click to browse files
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PDF, DOCX up to {MAX_SIZE_MB}MB — metadata auto-extracted
                </p>
              </div>
            )}
          </div>

          {fileError && <p className="text-sm text-red-500">{fileError}</p>}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/jd")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !!fileError}
              loading={isPending}
            >
              Upload & Create
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={showCreateDepartment}
        onClose={handleCloseCreateDepartmentModal}
        title="Create Department"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Department name"
            placeholder="e.g. Engineering"
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
          />
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseCreateDepartmentModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateDepartment}
              disabled={!newDepartmentName.trim()}
              loading={createDepartmentMutation.isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
