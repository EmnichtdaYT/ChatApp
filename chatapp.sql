PGDMP     #    )                z            chatapp    14.1    14.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false                       1262    16394    chatapp    DATABASE     d   CREATE DATABASE chatapp WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'German_Germany.1252';
    DROP DATABASE chatapp;
                postgres    false            ?            1259    16409    chatmessages    TABLE       CREATE TABLE public.chatmessages (
    chatid character varying(20) NOT NULL,
    messageid character varying(20) NOT NULL,
    sentby character varying(50),
    message character varying(200),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
     DROP TABLE public.chatmessages;
       public         heap    postgres    false            ?            1259    16419    chatpermissions    TABLE     ?   CREATE TABLE public.chatpermissions (
    chatid character varying(20) NOT NULL,
    haspermission character varying(50) NOT NULL
);
 #   DROP TABLE public.chatpermissions;
       public         heap    postgres    false            ?            1259    16414    chats    TABLE     I   CREATE TABLE public.chats (
    chatid character varying(20) NOT NULL
);
    DROP TABLE public.chats;
       public         heap    postgres    false            ?            1259    16395    test    TABLE     6   CREATE TABLE public.test (
    id integer NOT NULL
);
    DROP TABLE public.test;
       public         heap    postgres    false            ?            1259    16401    users    TABLE     h   CREATE TABLE public.users (
    name character varying(50) NOT NULL,
    pass character varying(100)
);
    DROP TABLE public.users;
       public         heap    postgres    false            
          0    16409    chatmessages 
   TABLE DATA           W   COPY public.chatmessages (chatid, messageid, sentby, message, "timestamp") FROM stdin;
    public          postgres    false    211                    0    16419    chatpermissions 
   TABLE DATA           @   COPY public.chatpermissions (chatid, haspermission) FROM stdin;
    public          postgres    false    213   ?                 0    16414    chats 
   TABLE DATA           '   COPY public.chats (chatid) FROM stdin;
    public          postgres    false    212   ?                 0    16395    test 
   TABLE DATA           "   COPY public.test (id) FROM stdin;
    public          postgres    false    209          	          0    16401    users 
   TABLE DATA           +   COPY public.users (name, pass) FROM stdin;
    public          postgres    false    210   >       o           2606    16413    chatmessages chatmessages_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY public.chatmessages
    ADD CONSTRAINT chatmessages_pkey PRIMARY KEY (chatid, messageid);
 H   ALTER TABLE ONLY public.chatmessages DROP CONSTRAINT chatmessages_pkey;
       public            postgres    false    211    211            v           2606    16423 $   chatpermissions chatpermissions_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY public.chatpermissions
    ADD CONSTRAINT chatpermissions_pkey PRIMARY KEY (chatid, haspermission);
 N   ALTER TABLE ONLY public.chatpermissions DROP CONSTRAINT chatpermissions_pkey;
       public            postgres    false    213    213            t           2606    16418    chats chats_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (chatid);
 :   ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_pkey;
       public            postgres    false    212            m           2606    16405    users pk_users 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT pk_users PRIMARY KEY (name);
 8   ALTER TABLE ONLY public.users DROP CONSTRAINT pk_users;
       public            postgres    false    210            p           1259    16441    fki_chatmessages_chats_fk    INDEX     T   CREATE INDEX fki_chatmessages_chats_fk ON public.chatmessages USING btree (chatid);
 -   DROP INDEX public.fki_chatmessages_chats_fk;
       public            postgres    false    211            q           1259    16435    fki_chatmessages_users_fk    INDEX     T   CREATE INDEX fki_chatmessages_users_fk ON public.chatmessages USING btree (sentby);
 -   DROP INDEX public.fki_chatmessages_users_fk;
       public            postgres    false    211            w           1259    16453    fki_chatpermissions_chats_fk    INDEX     Z   CREATE INDEX fki_chatpermissions_chats_fk ON public.chatpermissions USING btree (chatid);
 0   DROP INDEX public.fki_chatpermissions_chats_fk;
       public            postgres    false    213            x           1259    16447    fki_chatpermissions_users_fk    INDEX     a   CREATE INDEX fki_chatpermissions_users_fk ON public.chatpermissions USING btree (haspermission);
 0   DROP INDEX public.fki_chatpermissions_users_fk;
       public            postgres    false    213            r           1259    16429    fki_f    INDEX     @   CREATE INDEX fki_f ON public.chatmessages USING btree (sentby);
    DROP INDEX public.fki_f;
       public            postgres    false    211            z           2606    16436 "   chatmessages chatmessages_chats_fk    FK CONSTRAINT     ?   ALTER TABLE ONLY public.chatmessages
    ADD CONSTRAINT chatmessages_chats_fk FOREIGN KEY (chatid) REFERENCES public.chats(chatid) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;
 L   ALTER TABLE ONLY public.chatmessages DROP CONSTRAINT chatmessages_chats_fk;
       public          postgres    false    211    212    3188            y           2606    16430 "   chatmessages chatmessages_users_fk    FK CONSTRAINT     ?   ALTER TABLE ONLY public.chatmessages
    ADD CONSTRAINT chatmessages_users_fk FOREIGN KEY (sentby) REFERENCES public.users(name) ON UPDATE CASCADE NOT VALID;
 L   ALTER TABLE ONLY public.chatmessages DROP CONSTRAINT chatmessages_users_fk;
       public          postgres    false    3181    210    211            |           2606    16448 (   chatpermissions chatpermissions_chats_fk    FK CONSTRAINT     ?   ALTER TABLE ONLY public.chatpermissions
    ADD CONSTRAINT chatpermissions_chats_fk FOREIGN KEY (chatid) REFERENCES public.chats(chatid) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;
 R   ALTER TABLE ONLY public.chatpermissions DROP CONSTRAINT chatpermissions_chats_fk;
       public          postgres    false    212    3188    213            {           2606    16442 (   chatpermissions chatpermissions_users_fk    FK CONSTRAINT     ?   ALTER TABLE ONLY public.chatpermissions
    ADD CONSTRAINT chatpermissions_users_fk FOREIGN KEY (haspermission) REFERENCES public.users(name) ON UPDATE CASCADE NOT VALID;
 R   ALTER TABLE ONLY public.chatpermissions DROP CONSTRAINT chatpermissions_users_fk;
       public          postgres    false    210    213    3181            
   ?   x?sv????J?.?J??L)??72?4?L???L?(II??H????4202?50?52Q0??26?24?307313?r?f?[Qy?yy??K@iX?Y?{bAi!??p?Byb?P b????????????????????W? ?c0?         2   x?sv????J?.?J??L)??72?L???L?(II?,?rī?+F??? l??         "   x?sv????J?.?J??L)??72?????? |
            x?3?2?22Ⲵ?????? C
      	       x?K???L?(II?L??????$?=... ?Dp     