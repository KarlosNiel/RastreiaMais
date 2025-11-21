"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useAppointments } from "@/lib/hooks/appointments/useAppointments";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";

interface CreateAppointmentModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    preSelectedPatientId?: string | null;
}

export default function CreateAppointmentsModal({
    open,
    onOpenChange,
    preSelectedPatientId,
}: CreateAppointmentModalProps) {
    const { create } = useAppointments();

    const [form, setForm] = useState({
        professional_id: "",
        professional_name: "",
        local_id: "",
        scheduled_datetime: "",
        risk_level: "Seguro",
        type: "Consulta",
        description: "",
    });

    const { data: patient, isLoading: loadingPatient } = useQuery({
        queryKey: ["patient", preSelectedPatientId],
        queryFn: async () => {
            if (!preSelectedPatientId) return null;
            return apiGet<any>(`/api/v1/accounts/patients/${preSelectedPatientId}/`);
        },
        enabled: open && !!preSelectedPatientId,
    });

    const { data: professionals = [], isLoading: loadingProfessionals } = useQuery({
        queryKey: ["professionals"],
        queryFn: async () => {
            const resp = await apiGet<any>("/api/v1/accounts/professionals/");
            return Array.isArray(resp) ? resp : resp?.results || [];
        },
        enabled: open,
    });

    const { data: institutions = [], isLoading: loadingInstitutions } = useQuery({
        queryKey: ["institutions"],
        queryFn: async () => {
            const resp = await apiGet<any>("/api/v1/locations/institutions/");
            return Array.isArray(resp) ? resp : resp?.results || [];
        },
        enabled: open,
    });

    useEffect(() => {
        if (!open) {
            setForm({
                professional_id: "",
                professional_name: "",
                local_id: "",
                scheduled_datetime: "",
                risk_level: "Seguro",
                type: "Consulta",
                description: "",
            });
        }
    }, [open]);

    const onSubmit = async () => {
        if (!preSelectedPatientId) return alert("Paciente não selecionado");
        if (!form.professional_id) return alert("Selecione um profissional");
        if (!form.local_id) return alert("Selecione a instituição");
        if (!form.scheduled_datetime) return alert("Defina data e hora");

        const payload: any = {
            patient_id: Number(preSelectedPatientId),
            professional_id: Number(form.professional_id),
            local_id: Number(form.local_id),
            scheduled_datetime: form.scheduled_datetime,
            risk_level: form.risk_level,
            type: form.type,
            status: "ativo",
        };

        if (form.description.trim()) payload.description = form.description.trim();

        try {
            await create.mutateAsync(payload);
            alert("Agendamento criado com sucesso!");
            onOpenChange(false);
        } catch (err: any) {
            alert(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                JSON.stringify(err?.response?.data || "Erro")
            );
        }
    };

    const isLoading =
        loadingPatient || loadingProfessionals || loadingInstitutions;

    const formatCpf = (cpf?: string) => {
        if (!cpf) return "";
        const d = cpf.replace(/\D/g, "");
        if (d.length !== 11) return cpf;
        return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };

    return (
        <Modal
            isOpen={open}
            onOpenChange={onOpenChange}
            size="lg"
            scrollBehavior="inside"
            classNames={{ base: "rounded-2xl shadow-xl" }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 pb-0">
                    <h2 className="text-xl font-semibold">Novo Agendamento</h2>
                    <p className="text-sm text-default-500">
                        Preencha as informações abaixo para criar o agendamento
                    </p>
                </ModalHeader>

                <ModalBody className="space-y-6 pt-2 pb-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Spinner size="lg" color="warning" />
                        </div>
                    ) : (
                        <>
                            {/* PACIENTE */}
                            <div className="bg-default-50 rounded-xl p-4 border border-default-200 shadow-sm">
                                <p className="text-xs text-default-500 mb-1">Paciente</p>
                                <p className="font-semibold text-default-900 text-base">
                                    {patient?.user?.first_name} {patient?.user?.last_name}
                                </p>
                                <p className="text-sm text-default-700">
                                    CPF: {formatCpf(patient?.cpf)}
                                </p>
                            </div>

                            {/* PROFISSIONAL */}
                            <Select
                                label="Profissional *"
                                variant="bordered"
                                radius="lg"
                                className="w-full"
                                placeholder="Selecione um profissional"
                                selectedKeys={form.professional_id ? [form.professional_id] : []}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0];
                                    const prof = professionals.find((p: any) => String(p.id) === key);

                                    setForm({
                                        ...form,
                                        professional_id: String(key),
                                        professional_name: prof
                                            ? `${prof.user?.first_name} ${prof.user?.last_name}`
                                            : "",
                                    });
                                }}
                                renderValue={() =>
                                    form.professional_name ? (
                                        <span className="text-default-900">
                                            {form.professional_name}
                                        </span>
                                    ) : null
                                }
                            >
                                {professionals.map((p: any) => (
                                    <SelectItem key={String(p.id)} value={String(p.id)}>
                                        {p.user?.first_name} {p.user?.last_name}
                                        {p.specialty ? ` - ${p.specialty}` : ""}
                                    </SelectItem>
                                ))}
                            </Select>

                            {/* INSTITUIÇÃO */}
                            <Select
                                label="Instituição *"
                                variant="bordered"
                                radius="lg"
                                className="w-full"
                                placeholder="Selecione a instituição"
                                selectedKeys={form.local_id ? [form.local_id] : []}
                                onSelectionChange={(keys) => {
                                    const key = Array.from(keys)[0];
                                    setForm({ ...form, local_id: String(key) });
                                }}
                                renderValue={(items) =>
                                    items.length > 0 ? (
                                        <span className="text-default-900">
                                            {items[0].textValue}
                                        </span>
                                    ) : null
                                }
                            >
                                {institutions.map((i: any) => (
                                    <SelectItem key={String(i.id)} value={String(i.id)}>
                                        {i.name}
                                    </SelectItem>
                                ))}
                            </Select>

                            {/* DATA */}
                            <Input
                                type="datetime-local"
                                label="Data e Hora *"
                                variant="bordered"
                                radius="lg"
                                value={form.scheduled_datetime}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        scheduled_datetime: e.target.value,
                                    })
                                }
                            />

                            {/* TIPO */}
                            <Select
                                label="Tipo *"
                                variant="bordered"
                                radius="lg"
                                selectedKeys={[form.type]}
                                onChange={(e) =>
                                    setForm({ ...form, type: e.target.value })
                                }
                            >
                                <SelectItem key="Consulta">Consulta</SelectItem>
                                <SelectItem key="Exame">Exame</SelectItem>
                                <SelectItem key="Evento">Evento</SelectItem>
                            </Select>

                            {/* RISCO */}
                            <Select
                                label="Nível de Risco *"
                                variant="bordered"
                                radius="lg"
                                selectedKeys={[form.risk_level]}
                                onChange={(e) =>
                                    setForm({ ...form, risk_level: e.target.value })
                                }
                            >
                                <SelectItem key="Seguro">Seguro</SelectItem>
                                <SelectItem key="Moderado">Moderado</SelectItem>
                                <SelectItem key="Crítico">Crítico</SelectItem>
                            </Select>

                            {/* DESCRIÇÃO */}
                            <Textarea
                                label="Descrição"
                                variant="bordered"
                                radius="lg"
                                minRows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                            />

                            {/* BOTÕES */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="flat" radius="lg" onPress={() => onOpenChange(false)}>
                                    Cancelar
                                </Button>

                                <Button
                                    color="primary"
                                    radius="lg"
                                    onPress={onSubmit}
                                    isLoading={create.isPending}
                                >
                                    Criar Agendamento
                                </Button>
                            </div>
                        </>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
