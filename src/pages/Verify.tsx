import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as yup from "yup";
import Input from "../components/Input";
import Button from "../components/Button";

type FormDataType = {
    email: string;
    code: string;
}

const validationSchema = yup
    .object({
        email: yup.string().email().required(),
        code: yup.string().length(6).required()
    })
    .required();


function Verify() {
    const { state } = useLocation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormDataType>({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            email: state.email
        }
    });

    const navigate = useNavigate();

    const onSubmit = (data: FormDataType) => {
        console.log(data);
        navigate('/secure', { state: { email: data.email } });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <p className="text-left text-3xl font-extrabold text-gray-900 mb-3 p-3">Verify</p>
            <Input label="Email" {...register("email")} error={errors.email?.message} readOnly />
            <Input label="Enter the code" {...register("code")} error={errors.code?.message} type="number" />
            <Button type="submit" size="md" className="font-bold ml-auto">
            Verify
            </Button>
        </form>
    );
}

export default Verify;