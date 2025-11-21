"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { useAppointments } from "@/lib/hooks/appointments/useAppointments";
import { Spinner } from "@heroui/spinner";
import { useEffect, useState } from "react";

export default function AppointmentsModal({
    open,
    onOpenChange,
    appointment,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    appointment?: any | null;
}) {
    const creating = !appointment;

    const { create, remove } = useAppointments();

    const [form, setForm] = useState({
        patient: "",
        professional: "",
        scheduled_datetime: "",
        local: "",
        risk_level: "",
        type: "",
        description: "",
    });

    // Preenche ao abrir para visualizar
    useEffect(() => {
        if (appointment) {
            setForm({
                patient: appointment.patient?.id ?? "",
                professional: appointment.professional?.id ?? "",
                scheduled_datetime: appointment.scheduled_datetime?.slice(0, 16),
                local: appointment.local?.id ?? "",
                risk_level: appointment.risk_level,
                type: appointment.type,
                description: appointment.description ?? "",
            });
        } else {
            setForm({
                patient: "",
                professional: "",
                scheduled_datetime: "",
                local: "",
                risk_level: "",
                type: "",
                description: "",
            });
        }
    }, [appointment]);

    const onSubmit = async () => {
        await create.mutateAsync(form);
        onOpenChange(false);
    };

    const onDelete = async () => {
        if (!appointment) return;
        await remove.mutateAsync(appointment.id);
        onOpenChange(false);
    };

    return (
        <Modal isOpen={open} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
                <ModalHeader>
                    {creating ? "Novo Agendamento" : "Detalhes do Agendamento"}
                </ModalHeader>

                <ModalBody className="space-y-4">

                    {/* Paciente */}
                    <Input
                        label="ID do Paciente"
                        value={String(form.patient)}
                        onChange={(e) => setForm({ ...form, patient: e.target.value })}
                        disabled={!creating}
                    />

                    {/* Profissional */}
                    <Input
                        label="ID do Profissional"
                        value={String(form.professional)}
                        onChange={(e) =>
                            setForm({ ...form, professional: e.target.value })
                        }
                        disabled={!creating}
                    />

                    {/* Data e hora */}
                    <Input
                        type="datetime-local"
                        label="Data e Hora"
                        value={form.scheduled_datetime}
                        onChange={(e) =>
                            setForm({ ...form, scheduled_datetime: e.target.value })
                        }
                    />

                    {/* Tipo */}
                    <Select
                        label="Tipo"
                        selectedKeys={[form.type]}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        <SelectItem key="Consulta">Consulta</SelectItem>
                        <SelectItem key="Exame">Exame</SelectItem>
                        <SelectItem key="Evento">Evento</SelectItem>
                    </Select>

                    {/* Risco */}
                    <Select
                        label="Risco"
                        selectedKeys={[form.risk_level]}
                        onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
                    >
                        <SelectItem key="Seguro">Seguro</SelectItem>
                        <SelectItem key="Moderado">Moderado</SelectItem>
                        <SelectItem key="Crítico">Crítico</SelectItem>
                    </Select>

                    <Textarea
                        label="Descrição"
                        value={form.description}
                        onChange={(e) =>
                            setForm({ ...form, description: e.target.value })
                        }
                    />

                    {/* Botões */}
                    <div className="flex justify-between pt-2">
                        {!creating && (
                            <Button
                                color="danger"
                                variant="flat"
                                onPress={onDelete}
                                isLoading={remove.isPending}
                            >
                                Deletar
                            </Button>
                        )}

                        <Button
                            color="primary"
                            onPress={onSubmit}
                            isLoading={create.isPending}
                        >
                            {creating ? "Criar Agendamento" : "Salvar"}
                        </Button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
